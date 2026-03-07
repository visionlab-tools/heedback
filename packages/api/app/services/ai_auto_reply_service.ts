import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import redis from '@adonisjs/redis/services/main'
import Conversation from '#models/conversation'
import Message from '#models/message'
import Organization from '#models/organization'
import EndUser from '#models/end_user'
import { sseService } from '#services/sse_service'
import KnowledgeRetrievalService from '#services/knowledge_retrieval_service'

const LOCK_TTL = 30
const REPLY_DELAY_MS = 1500

const HANDOFF_TOOL = {
  name: 'handoff_to_human',
  description:
    'Call this tool when the user explicitly asks to speak with a human agent, ' +
    'or when you cannot answer their question from the knowledge base. ' +
    'Do NOT call this tool if you can answer the question.',
}

/** Anthropic tool definition */
const ANTHROPIC_TOOLS = [
  {
    name: HANDOFF_TOOL.name,
    description: HANDOFF_TOOL.description,
    input_schema: { type: 'object' as const, properties: {} },
  },
]

/** OpenAI function definition */
const OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: HANDOFF_TOOL.name,
      description: HANDOFF_TOOL.description,
      parameters: { type: 'object', properties: {} },
    },
  },
]

export default class AiAutoReplyService {
  static maybeReply(orgId: string, conversationId: string): void {
    setTimeout(() => {
      AiAutoReplyService.process(orgId, conversationId).catch((err) => {
        console.error('[AiAutoReply] Error:', err)
      })
    }, REPLY_DELAY_MS)
  }

  private static async process(orgId: string, conversationId: string) {
    const org = await Organization.find(orgId)
    if (!org) return

    const settings = (org.settings ?? {}) as Record<string, unknown>
    if (!settings.aiAutoReplyEnabled) return

    const anthropicKey = settings.anthropicApiKey as string | undefined
    const openaiKey = settings.openaiApiKey as string | undefined
    if (!anthropicKey && !openaiKey) return

    const conversation = await Conversation.find(conversationId)
    if (!conversation) return
    if (conversation.status !== 'open' || conversation.assignedToId) return

    // Concurrency guard — only one AI reply per conversation at a time
    const lockKey = `ai-reply:${conversationId}`
    const acquired = await redis.set(lockKey, '1', 'EX', LOCK_TTL, 'NX')
    if (!acquired) return

    try {
      await AiAutoReplyService.generateAndSend(org, conversation, anthropicKey, openaiKey)
    } finally {
      await redis.del(lockKey)
    }
  }

  private static async generateAndSend(
    org: Organization,
    conversation: Conversation,
    anthropicKey: string | undefined,
    openaiKey: string | undefined,
  ) {
    const allMessages = await Message.query()
      .where('conversation_id', conversation.id)
      .where('is_internal', false)
      .orderBy('created_at', 'asc')

    if (!allMessages.length) return

    const lastMsg = allMessages[allMessages.length - 1]
    if (lastMsg.senderType !== 'end_user') return

    const endUser = await EndUser.find(conversation.endUserId)
    const settings = (org.settings ?? {}) as Record<string, unknown>
    const preferredLocale = endUser?.language
      || (settings.defaultLocale as string | undefined)
      || 'en'

    const userTexts = allMessages
      .filter((m) => m.senderType === 'end_user')
      .map((m) => m.body)

    const knowledgeBase = await KnowledgeRetrievalService.retrieve(
      org.id,
      userTexts,
      preferredLocale,
      openaiKey,
    )
    const systemPrompt = AiAutoReplyService.buildSystemPrompt(org.name, knowledgeBase)

    const chatMessages = allMessages.map((m) => ({
      role: (m.senderType === 'end_user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.body,
    }))

    const result = anthropicKey
      ? await AiAutoReplyService.callAnthropicWithTools(anthropicKey, systemPrompt, chatMessages)
      : await AiAutoReplyService.callOpenAIWithTools(openaiKey!, systemPrompt, chatMessages)

    if (result.handoff) {
      const handoffReply = result.text
        || "I'll connect you with a team member who can help. Someone will be with you shortly!"
      await AiAutoReplyService.sendSystemMessage(org, conversation, handoffReply)
      return
    }

    if (!result.text?.trim()) return
    await AiAutoReplyService.sendSystemMessage(org, conversation, result.text)
  }

  /** Call Anthropic with the handoff tool available */
  private static async callAnthropicWithTools(
    apiKey: string,
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<{ text: string; handoff: boolean }> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        tools: ANTHROPIC_TOOLS,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${text.slice(0, 500)}`)
    }

    const data = await res.json() as {
      content?: Array<{ type: string; text?: string; name?: string }>
      stop_reason?: string
    }

    const blocks = data.content ?? []
    const handoff = blocks.some((b) => b.type === 'tool_use' && b.name === HANDOFF_TOOL.name)
    const text = blocks
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('')

    return { text, handoff }
  }

  /** Call OpenAI with the handoff function available */
  private static async callOpenAIWithTools(
    apiKey: string,
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<{ text: string; handoff: boolean }> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        tools: OPENAI_TOOLS,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OpenAI API error (${res.status}): ${text.slice(0, 500)}`)
    }

    const data = await res.json() as {
      choices?: Array<{
        message?: {
          content?: string | null
          tool_calls?: Array<{ function?: { name?: string } }>
        }
        finish_reason?: string
      }>
    }

    const choice = data.choices?.[0]?.message
    const handoff = choice?.tool_calls?.some(
      (tc) => tc.function?.name === HANDOFF_TOOL.name,
    ) ?? false
    const text = choice?.content ?? ''

    return { text, handoff }
  }

  private static buildSystemPrompt(orgName: string, knowledgeBase: string): string {
    return `You are Heedbot, a helpful AI support assistant for ${orgName}.
Answer using ONLY the knowledge base below. If the answer isn't there, use the handoff_to_human tool to transfer to a team member.
When the user explicitly asks to speak with a human, use the handoff_to_human tool.
Be concise, friendly, professional. Never invent information. Never mention articles.
Reply in the same language as the user's message.

<knowledge_base>
${knowledgeBase}
</knowledge_base>`
  }

  private static async sendSystemMessage(
    org: Organization,
    conversation: Conversation,
    body: string,
  ) {
    const message = await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'system',
      senderId: null,
      body,
      isInternal: false,
      attachments: [],
    })

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    await conversation.save()

    const serialized = {
      ...message.serialize(),
      sender: { name: 'Heedbot', avatarUrl: null },
    }

    sseService.publish(`conversation:${conversation.id}`, {
      event: 'message.created',
      data: serialized,
    })
    sseService.publish(`org:${org.id}:inbox`, {
      event: 'message.created',
      data: { ...serialized, conversationId: conversation.id },
    })
  }
}
