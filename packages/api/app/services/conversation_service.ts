import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import Conversation from '#models/conversation'
import Message from '#models/message'
import EndUser from '#models/end_user'
import Organization from '#models/organization'

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

    const conversations = await query.paginate(page, limit)

    return conversations
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

    return {
      conversation,
      messages,
    }
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

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    await conversation.save()

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

  async publicCreate(orgSlug: string, data: PublicCreateData) {
    const org = await Organization.findBy('slug', orgSlug)
    if (!org) return null

    let endUser = null
    if (data.endUserEmail) {
      endUser = await EndUser.query()
        .where('organization_id', org.id)
        .where('email', data.endUserEmail)
        .first()

      if (!endUser) {
        endUser = await EndUser.create({
          id: uuid(),
          organizationId: org.id,
          email: data.endUserEmail,
          name: data.endUserName ?? null,
        })
      }
    }

    const conversation = await Conversation.create({
      id: uuid(),
      organizationId: org.id,
      endUserId: endUser?.id ?? null,
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
      senderId: endUser?.id ?? null,
      body: data.body,
      isInternal: false,
    })

    await conversation.load('endUser')

    return conversation
  }

  async publicShow(orgSlug: string, conversationId: string) {
    const org = await Organization.findBy('slug', orgSlug)
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
      .orderBy('created_at', 'asc')

    return {
      conversation,
      messages,
    }
  }

  async publicReply(orgSlug: string, conversationId: string, data: PublicReplyData) {
    const org = await Organization.findBy('slug', orgSlug)
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

    return message
  }
}
