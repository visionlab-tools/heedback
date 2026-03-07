import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import Conversation from '#models/conversation'
import Message from '#models/message'
import type { Attachment } from '#models/message'
import EndUser from '#models/end_user'
import Organization from '#models/organization'
import WebhookService from '#services/webhook_service'
import PushNotificationService from '#services/push_notification_service'
import AiAutoReplyService from '#services/ai_auto_reply_service'
import { sseService } from '#services/sse_service'
import { isUuid } from '#helpers/uuid'
import { resolveStorageUrl } from '#helpers/storage'
import db from '@adonisjs/lucid/services/db'

interface ListFilters {
  page?: number
  limit?: number
  status?: string
  assignedToId?: string
  adminUserId?: string
}

interface UpdateData {
  status?: 'open' | 'assigned' | 'resolved' | 'closed'
  assignedToId?: string | null
}

interface SendMessageData {
  body?: string
  isInternal?: boolean
  attachments?: Attachment[]
}

interface PublicCreateData {
  endUserId?: string
  endUserExternalId?: string
  endUserFirstName?: string
  endUserLastName?: string
  endUserEmail?: string
  endUserAvatarUrl?: string
  endUserPosition?: string
  endUserCompany?: string
  endUserPricingPlan?: string
  endUserLanguage?: string
  endUserMetadata?: Record<string, string | number>
  subject?: string | null
  channel?: 'widget' | 'portal' | 'email'
  body?: string
  attachments?: Attachment[]
  pageUrl?: string
}

interface PublicReplyData {
  body?: string
  attachments?: Attachment[]
  pageUrl?: string
}

export default class ConversationService {
  private webhookService = new WebhookService()
  private pushService = new PushNotificationService()

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

    // Left-join read tracking so we can compute isUnread per conversation
    if (filters.adminUserId) {
      query.leftJoin('conversation_reads as cr', (join) => {
        join
          .on('cr.conversation_id', '=', 'conversations.id')
          .andOnVal('cr.admin_user_id', '=', filters.adminUserId!)
      })
      query.select('conversations.*')
      query.select(
        db.rawQuery(
          `(cr.read_at IS NULL OR conversations.last_message_at > cr.read_at) AS is_unread`,
        ),
      )
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

    // Resolve attachment S3 keys to full URLs
    const serializedMessages = messages.map((m) => {
      const base = m.serialize()
      return {
        ...base,
        attachments: (base.attachments ?? []).map((a: any) => ({
          ...a,
          url: resolveStorageUrl(a.key),
        })),
      }
    })

    return { conversation, serializedMessages }
  }

  async markAsRead(conversationId: string, adminUserId: string) {
    await db.rawQuery(
      `INSERT INTO conversation_reads (admin_user_id, conversation_id, read_at)
       VALUES (?, ?, NOW())
       ON CONFLICT (admin_user_id, conversation_id)
       DO UPDATE SET read_at = NOW()`,
      [adminUserId, conversationId],
    )
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

    if (!data.body?.trim() && (!data.attachments || data.attachments.length === 0)) {
      throw new Error('Message must have body or attachments')
    }

    const message = await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'admin',
      senderId: adminUserId,
      body: data.body ?? '',
      isInternal: data.isInternal ?? false,
      attachments: data.attachments ?? [],
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
   * Priority: existing by internal ID → by externalId → by email → new.
   */
  private async resolveOrCreateEndUser(orgId: string, data: PublicCreateData) {
    // 1. Reuse existing end user by internal UUID (localStorage persistence)
    if (data.endUserId) {
      const existing = await EndUser.query()
        .where('id', data.endUserId)
        .where('organization_id', orgId)
        .first()
      if (existing) {
        await this.syncEndUserFields(existing, data)
        return existing
      }
    }

    // 2. Match by external ID from the host application
    if (data.endUserExternalId) {
      const byExternal = await EndUser.query()
        .where('organization_id', orgId)
        .where('external_id', data.endUserExternalId)
        .first()

      if (byExternal) {
        await this.syncEndUserFields(byExternal, data)
        return byExternal
      }

      return EndUser.create({
        id: uuid(),
        organizationId: orgId,
        externalId: data.endUserExternalId,
        email: data.endUserEmail ?? null,
        firstName: data.endUserFirstName ?? null,
        lastName: data.endUserLastName ?? null,
        avatarUrl: data.endUserAvatarUrl ?? null,
        position: data.endUserPosition ?? null,
        company: data.endUserCompany ?? null,
        pricingPlan: data.endUserPricingPlan ?? null,
        language: data.endUserLanguage ?? null,
        metadata: data.endUserMetadata ?? null,
      })
    }

    // 3. Match by email
    if (data.endUserEmail) {
      const byEmail = await EndUser.query()
        .where('organization_id', orgId)
        .where('email', data.endUserEmail)
        .first()

      if (byEmail) {
        await this.syncEndUserFields(byEmail, data)
        return byEmail
      }

      return EndUser.create({
        id: uuid(),
        organizationId: orgId,
        email: data.endUserEmail,
        firstName: data.endUserFirstName ?? null,
        lastName: data.endUserLastName ?? null,
        avatarUrl: data.endUserAvatarUrl ?? null,
        position: data.endUserPosition ?? null,
        company: data.endUserCompany ?? null,
        pricingPlan: data.endUserPricingPlan ?? null,
        language: data.endUserLanguage ?? null,
        metadata: data.endUserMetadata ?? null,
      })
    }

    // 4. Anonymous end user
    return EndUser.create({
      id: uuid(),
      organizationId: orgId,
      email: null,
      firstName: data.endUserFirstName ?? null,
      lastName: data.endUserLastName ?? null,
      avatarUrl: data.endUserAvatarUrl ?? null,
      position: data.endUserPosition ?? null,
      company: data.endUserCompany ?? null,
      pricingPlan: data.endUserPricingPlan ?? null,
      language: data.endUserLanguage ?? null,
      metadata: data.endUserMetadata ?? null,
    })
  }

  /** Keep end user profile in sync with latest identify data */
  private async syncEndUserFields(endUser: EndUser, data: PublicCreateData) {
    let dirty = false

    const sync = <K extends keyof EndUser>(field: K, value: EndUser[K] | undefined) => {
      if (value !== undefined && endUser[field] !== value) {
        ;(endUser as any)[field] = value
        dirty = true
      }
    }

    sync('firstName', data.endUserFirstName)
    sync('lastName', data.endUserLastName)
    sync('email', data.endUserEmail)
    sync('avatarUrl', data.endUserAvatarUrl)
    sync('externalId', data.endUserExternalId)
    sync('position', data.endUserPosition)
    sync('company', data.endUserCompany)
    sync('pricingPlan', data.endUserPricingPlan)
    sync('language', data.endUserLanguage)

    // Shallow-merge metadata
    if (data.endUserMetadata) {
      endUser.metadata = { ...endUser.metadata, ...data.endUserMetadata }
      dirty = true
    }

    if (dirty) await endUser.save()
  }

  async publicCreate(orgIdentifier: string, data: PublicCreateData) {
    if (!data.body?.trim() && (!data.attachments || data.attachments.length === 0)) {
      throw new Error('Message must have body or attachments')
    }

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
      body: data.body ?? '',
      isInternal: false,
      attachments: data.attachments ?? [],
      pageUrl: data.pageUrl ?? null,
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
        endUserFirstName: data.endUserFirstName,
        endUserLastName: data.endUserLastName,
      },
    })

    sseService.publish(`org:${org.id}:inbox`, {
      event: 'conversation.created',
      data: conversation.serialize(),
    })

    // Fire-and-forget browser push to all org members
    this.pushService.sendToOrg(org.id, {
      title: conversation.subject ?? 'New conversation',
      body: (data.body ?? '').slice(0, 200),
      conversationId: conversation.id,
      orgId: org.id,
    })

    AiAutoReplyService.maybeReply(org.id, conversation.id)

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
    if (!data.body?.trim() && (!data.attachments || data.attachments.length === 0)) {
      throw new Error('Message must have body or attachments')
    }

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
      body: data.body ?? '',
      isInternal: false,
      attachments: data.attachments ?? [],
      pageUrl: data.pageUrl ?? null,
    })

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    if (conversation.status === 'resolved' || conversation.status === 'closed') {
      conversation.status = 'open'
    }
    await conversation.save()

    const serialized = this.serializeMessageWithSender(message)

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

    // Fire-and-forget browser push to all org members
    this.pushService.sendToOrg(org.id, {
      title: conversation.subject ?? 'New message',
      body: (data.body ?? '').slice(0, 200),
      conversationId: conversation.id,
      orgId: org.id,
    })

    AiAutoReplyService.maybeReply(org.id, conversation.id)

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
      .preload('messages', (q) => q.where('is_internal', false).orderBy('created_at', 'desc').limit(1))
      .orderBy('last_message_at', 'desc')
      .limit(50)
  }

  /** Serialize a message with admin sender info and resolved attachment URLs */
  private serializeMessageWithSender(message: Message) {
    const base = message.serialize()

    // Resolve S3 keys to full URLs for each attachment
    const attachments = (base.attachments ?? []).map((a: any) => ({
      ...a,
      url: resolveStorageUrl(a.key),
    }))

    let sender: { name: string; avatarUrl: string | null } | null = null
    if (message.senderType === 'admin' && message.adminUser) {
      sender = { name: message.adminUser.fullName, avatarUrl: message.adminUser.avatarUrl }
    } else if (message.senderType === 'system') {
      sender = { name: 'Heedbot', avatarUrl: null }
    }

    return { ...base, attachments, sender }
  }
}
