import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import Conversation from '#models/conversation'
import Message from '#models/message'
import EndUser from '#models/end_user'
import Organization from '#models/organization'
import WebhookService from '#services/webhook_service'
import { sseService } from '#services/sse_service'
import { isUuid } from '#helpers/uuid'

interface ListFilters {
  page?: number
  limit?: number
  status?: string
  assignedToId?: string
}

interface UpdateData {
  status?: 'open' | 'assigned' | 'resolved' | 'closed'
  assignedToId?: string | null
}

interface SendMessageData {
  body: string
  isInternal?: boolean
}

interface PublicCreateData {
  endUserId?: string
  endUserEmail?: string
  endUserName?: string | null
  subject?: string | null
  channel?: 'widget' | 'portal' | 'email'
  body: string
}

interface PublicReplyData {
  body: string
}

export default class ConversationService {
  private webhookService = new WebhookService()

  async list(orgId: string, filters: ListFilters) {
    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)

    const query = Conversation.query()
      .where('organization_id', orgId)
      .preload('endUser')
      .preload('assignedTo')

    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.assignedToId) {
      query.where('assigned_to_id', filters.assignedToId)
    }

    query.orderBy('last_message_at', 'desc').orderBy('created_at', 'desc')

    return query.paginate(page, limit)
  }

  async show(orgId: string, conversationId: string) {
    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('organization_id', orgId)
      .preload('endUser')
      .preload('assignedTo')
      .first()

    if (!conversation) return null

    const messages = await Message.query()
      .where('conversation_id', conversation.id)
      .orderBy('created_at', 'asc')

    return { conversation, messages }
  }

  async update(orgId: string, conversationId: string, data: UpdateData) {
    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('organization_id', orgId)
      .first()

    if (!conversation) return null

    if (data.status !== undefined) {
      conversation.status = data.status
    }
    if (data.assignedToId !== undefined) {
      conversation.assignedToId = data.assignedToId
      if (data.assignedToId && conversation.status === 'open') {
        conversation.status = 'assigned'
      }
    }

    await conversation.save()
    await conversation.load('endUser')
    await conversation.load('assignedTo')

    sseService.publish(`org:${orgId}:inbox`, {
      event: 'conversation.updated',
      data: conversation.serialize(),
    })

    return conversation
  }

  async sendMessage(
    orgId: string,
    conversationId: string,
    adminUserId: string,
    data: SendMessageData,
  ) {
    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('organization_id', orgId)
      .first()

    if (!conversation) return null

    const message = await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'admin',
      senderId: adminUserId,
      body: data.body,
      isInternal: data.isInternal ?? false,
    })

    // Auto-assign admin on first reply
    if (!conversation.assignedToId) {
      conversation.assignedToId = adminUserId
      if (conversation.status === 'open') conversation.status = 'assigned'
    }

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    await conversation.save()

    // Include admin info for SSE consumers
    await message.load('adminUser')
    const serialized = this.serializeMessageWithSender(message)

    sseService.publish(`conversation:${conversationId}`, {
      event: 'message.created',
      data: serialized,
    })
    sseService.publish(`org:${orgId}:inbox`, {
      event: 'message.created',
      data: { ...serialized, conversationId },
    })

    return message
  }

  async delete(orgId: string, conversationId: string) {
    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('organization_id', orgId)
      .first()

    if (!conversation) return null

    await conversation.delete()
    return true
  }

  /** Resolve org by UUID or slug — widget passes UUID, portal passes slug */
  private async findOrgBySlugOrId(orgIdentifier: string) {
    if (isUuid(orgIdentifier)) {
      return Organization.query().where('id', orgIdentifier).first()
    }
    return Organization.query().where('slug', orgIdentifier).first()
  }

  /**
   * Find or create an EndUser for the conversation.
   * Priority: existing by ID → existing by email → new anonymous.
   */
  private async resolveOrCreateEndUser(orgId: string, data: PublicCreateData) {
    if (data.endUserId) {
      const existing = await EndUser.query()
        .where('id', data.endUserId)
        .where('organization_id', orgId)
        .first()
      if (existing) return existing
    }

    if (data.endUserEmail) {
      const byEmail = await EndUser.query()
        .where('organization_id', orgId)
        .where('email', data.endUserEmail)
        .first()

      if (byEmail) return byEmail

      return EndUser.create({
        id: uuid(),
        organizationId: orgId,
        email: data.endUserEmail,
        name: data.endUserName ?? null,
      })
    }

    // Anonymous end user — no email, no name
    return EndUser.create({
      id: uuid(),
      organizationId: orgId,
      email: null,
      name: data.endUserName ?? null,
    })
  }

  async publicCreate(orgIdentifier: string, data: PublicCreateData) {
    const org = await this.findOrgBySlugOrId(orgIdentifier)
    if (!org) return null

    const endUser = await this.resolveOrCreateEndUser(org.id, data)

    const conversation = await Conversation.create({
      id: uuid(),
      organizationId: org.id,
      endUserId: endUser.id,
      subject: data.subject ?? null,
      status: 'open',
      channel: data.channel ?? 'widget',
      messageCount: 1,
      lastMessageAt: DateTime.now(),
    })

    await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'end_user',
      senderId: endUser.id,
      body: data.body,
      isInternal: false,
    })

    await conversation.load('endUser')

    // Fire-and-forget webhooks
    this.webhookService.dispatch(org, {
      event: 'conversation.created',
      organizationId: org.id,
      data: {
        conversationId: conversation.id,
        body: data.body,
        channel: conversation.channel,
        endUserEmail: data.endUserEmail,
        endUserName: data.endUserName,
      },
    })

    sseService.publish(`org:${org.id}:inbox`, {
      event: 'conversation.created',
      data: conversation.serialize(),
    })

    return conversation
  }

  async publicShow(orgIdentifier: string, conversationId: string) {
    const org = await this.findOrgBySlugOrId(orgIdentifier)
    if (!org) return null

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('organization_id', org.id)
      .preload('endUser')
      .first()

    if (!conversation) return null

    const messages = await Message.query()
      .where('conversation_id', conversation.id)
      .where('is_internal', false)
      .preload('adminUser')
      .orderBy('created_at', 'asc')

    return {
      conversation,
      messages: messages.map((m) => this.serializeMessageWithSender(m)),
    }
  }

  async publicReply(orgIdentifier: string, conversationId: string, data: PublicReplyData) {
    const org = await this.findOrgBySlugOrId(orgIdentifier)
    if (!org) return null

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('organization_id', org.id)
      .first()

    if (!conversation) return null

    const message = await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'end_user',
      senderId: conversation.endUserId,
      body: data.body,
      isInternal: false,
    })

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    if (conversation.status === 'resolved' || conversation.status === 'closed') {
      conversation.status = 'open'
    }
    await conversation.save()

    const serialized = message.serialize()

    // Fire-and-forget webhooks
    this.webhookService.dispatch(org, {
      event: 'message.created',
      organizationId: org.id,
      data: {
        conversationId: conversation.id,
        messageId: message.id,
        body: data.body,
        endUserEmail: conversation.endUserId,
      },
    })

    sseService.publish(`conversation:${conversationId}`, {
      event: 'message.created',
      data: serialized,
    })
    sseService.publish(`org:${org.id}:inbox`, {
      event: 'message.created',
      data: { ...serialized, conversationId },
    })

    return message
  }

  /** List conversations for a specific end user (widget history) */
  async publicListByEndUser(orgIdentifier: string, endUserId: string) {
    const org = await this.findOrgBySlugOrId(orgIdentifier)
    if (!org) return null

    return Conversation.query()
      .where('organization_id', org.id)
      .where('end_user_id', endUserId)
      .preload('endUser')
      .orderBy('last_message_at', 'desc')
      .limit(50)
  }

  /** Serialize a message with admin sender info for public-facing responses */
  private serializeMessageWithSender(message: Message) {
    const base = message.serialize()
    if (message.senderType === 'admin' && message.adminUser) {
      return {
        ...base,
        sender: {
          name: message.adminUser.fullName,
          avatarUrl: message.adminUser.avatarUrl,
        },
      }
    }
    return { ...base, sender: null }
  }
}
