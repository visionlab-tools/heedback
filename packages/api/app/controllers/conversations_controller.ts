import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import Conversation from '#models/conversation'
import Message from '#models/message'
import EndUser from '#models/end_user'
import {
  createConversationValidator,
  sendMessageValidator,
  updateConversationValidator,
} from '#validators/conversation_validator'

export default class ConversationsController {
  /**
   * GET /api/v1/org/:orgSlug/conversations
   * Lists conversations (inbox) for admin
   */
  async index({ organization, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = Math.min(request.input('limit', 20), 100)
    const status = request.input('status')
    const assignedToId = request.input('assignedToId')

    const query = Conversation.query()
      .where('organization_id', organization.id)
      .preload('endUser')
      .preload('assignedTo')

    if (status) {
      query.where('status', status)
    }
    if (assignedToId) {
      query.where('assigned_to_id', assignedToId)
    }

    query.orderBy('last_message_at', 'desc').orderBy('created_at', 'desc')

    const conversations = await query.paginate(page, limit)

    return response.ok({
      data: conversations.all().map((c) => c.serialize()),
      meta: conversations.getMeta(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/conversations/:conversationId
   * Shows a single conversation with messages
   */
  async show({ organization, params, response }: HttpContext) {
    const conversation = await Conversation.query()
      .where('id', params.conversationId)
      .where('organization_id', organization.id)
      .preload('endUser')
      .preload('assignedTo')
      .first()

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    const messages = await Message.query()
      .where('conversation_id', conversation.id)
      .orderBy('created_at', 'asc')

    return response.ok({
      data: {
        ...conversation.serialize(),
        messages: messages.map((m) => m.serialize()),
      },
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/conversations/:conversationId
   * Updates conversation status or assignment
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateConversationValidator)

    const conversation = await Conversation.query()
      .where('id', params.conversationId)
      .where('organization_id', organization.id)
      .first()

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    if (payload.status !== undefined) {
      conversation.status = payload.status
    }
    if (payload.assignedToId !== undefined) {
      conversation.assignedToId = payload.assignedToId
      if (payload.assignedToId && conversation.status === 'open') {
        conversation.status = 'assigned'
      }
    }

    await conversation.save()
    await conversation.load('endUser')
    await conversation.load('assignedTo')

    return response.ok({
      data: conversation.serialize(),
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/conversations/:conversationId/messages
   * Admin sends a message in a conversation
   */
  async sendMessage({ organization, params, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendMessageValidator)
    const user = auth.user!

    const conversation = await Conversation.query()
      .where('id', params.conversationId)
      .where('organization_id', organization.id)
      .first()

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    const message = await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'admin',
      senderId: user.id,
      body: payload.body,
      isInternal: payload.isInternal ?? false,
    })

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    await conversation.save()

    return response.created({
      data: message.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/conversations/:conversationId
   * Deletes a conversation
   */
  async destroy({ organization, params, response }: HttpContext) {
    const conversation = await Conversation.query()
      .where('id', params.conversationId)
      .where('organization_id', organization.id)
      .first()

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    await conversation.delete()

    return response.ok({ message: 'Conversation deleted successfully' })
  }

  /*
  |--------------------------------------------------------------------------
  | Public API (no auth — for portal / widget)
  |--------------------------------------------------------------------------
  */

  /**
   * POST /api/v1/org/:orgSlug/public/conversations
   * End-user starts a new conversation
   */
  async publicStore({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createConversationValidator)

    // Resolve organization by slug
    const { default: Organization } = await import('#models/organization')
    const org = await Organization.findBy('slug', params.orgSlug)
    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    // Find or create end user if email provided
    let endUser = null
    if (payload.endUserEmail) {
      endUser = await EndUser.query()
        .where('organization_id', org.id)
        .where('email', payload.endUserEmail)
        .first()

      if (!endUser) {
        endUser = await EndUser.create({
          id: uuid(),
          organizationId: org.id,
          email: payload.endUserEmail,
          name: payload.endUserName ?? null,
        })
      }
    }

    const conversation = await Conversation.create({
      id: uuid(),
      organizationId: org.id,
      endUserId: endUser?.id ?? null,
      subject: payload.subject ?? null,
      status: 'open',
      channel: payload.channel ?? 'widget',
      messageCount: 1,
      lastMessageAt: DateTime.now(),
    })

    await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'end_user',
      senderId: endUser?.id ?? null,
      body: payload.body,
      isInternal: false,
    })

    await conversation.load('endUser')

    return response.created({
      data: conversation.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/public/conversations/:conversationId
   * End-user views their conversation
   */
  async publicShow({ params, response }: HttpContext) {
    const { default: Organization } = await import('#models/organization')
    const org = await Organization.findBy('slug', params.orgSlug)
    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const conversation = await Conversation.query()
      .where('id', params.conversationId)
      .where('organization_id', org.id)
      .preload('endUser')
      .first()

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    const messages = await Message.query()
      .where('conversation_id', conversation.id)
      .where('is_internal', false)
      .orderBy('created_at', 'asc')

    return response.ok({
      data: {
        ...conversation.serialize(),
        messages: messages.map((m) => m.serialize()),
      },
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/public/conversations/:conversationId/messages
   * End-user sends a reply
   */
  async publicReply({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendMessageValidator)

    const { default: Organization } = await import('#models/organization')
    const org = await Organization.findBy('slug', params.orgSlug)
    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const conversation = await Conversation.query()
      .where('id', params.conversationId)
      .where('organization_id', org.id)
      .first()

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    const message = await Message.create({
      id: uuid(),
      conversationId: conversation.id,
      senderType: 'end_user',
      senderId: conversation.endUserId,
      body: payload.body,
      isInternal: false,
    })

    conversation.messageCount = conversation.messageCount + 1
    conversation.lastMessageAt = DateTime.now()
    if (conversation.status === 'resolved' || conversation.status === 'closed') {
      conversation.status = 'open'
    }
    await conversation.save()

    return response.created({
      data: message.serialize(),
    })
  }
}
