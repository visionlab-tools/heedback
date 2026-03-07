import type { HttpContext } from '@adonisjs/core/http'
import {
  createConversationValidator,
  sendMessageValidator,
  publicReplyValidator,
  updateConversationValidator,
} from '#validators/conversation_validator'
import ConversationService from '#services/conversation_service'
import EndUser from '#models/end_user'
import { setEndUserCookie, readEndUserCookie } from '#helpers/end_user_cookie'

export default class ConversationsController {
  private conversationService = new ConversationService()

  async index({ organization, auth, request, response }: HttpContext) {
    const conversations = await this.conversationService.list(organization.id, {
      page: request.input('page', 1),
      limit: request.input('limit', 20),
      status: request.input('status'),
      assignedToId: request.input('assignedToId'),
      adminUserId: auth.user!.id,
    })

    return response.ok({
      data: conversations.all().map((c) => {
        const serialized = c.serialize()
        // is_unread comes from the raw SQL join — cast to boolean
        serialized.isUnread = Boolean(c.$extras.is_unread)
        return serialized
      }),
      meta: conversations.getMeta(),
    })
  }

  async show({ organization, auth, params, response }: HttpContext) {
    const result = await this.conversationService.show(organization.id, params.conversationId)

    if (!result) {
      return response.notFound({ message: 'Conversation not found' })
    }

    // Mark as read for the current admin
    await this.conversationService.markAsRead(params.conversationId, auth.user!.id)

    return response.ok({
      data: {
        ...result.conversation.serialize(),
        messages: result.serializedMessages,
      },
    })
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateConversationValidator)

    const conversation = await this.conversationService.update(
      organization.id,
      params.conversationId,
      payload,
    )

    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    return response.ok({ data: conversation.serialize() })
  }

  async sendMessage({ organization, params, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendMessageValidator)

    const message = await this.conversationService.sendMessage(
      organization.id,
      params.conversationId,
      auth.user!.id,
      { ...payload, attachments: payload.attachments },
    )

    if (!message) {
      return response.notFound({ message: 'Conversation not found' })
    }

    return response.created({ data: message.serialize() })
  }

  async destroy({ organization, params, response }: HttpContext) {
    const result = await this.conversationService.delete(organization.id, params.conversationId)

    if (!result) {
      return response.notFound({ message: 'Conversation not found' })
    }

    return response.ok({ message: 'Conversation deleted successfully' })
  }

  /** Resolve an end user by external ID — enables cross-domain widget continuity */
  async resolveEndUser({ params, request, response }: HttpContext) {
    const externalId = request.input('externalId')
    if (!externalId) {
      return response.badRequest({ message: 'externalId query param is required' })
    }

    const endUser = await EndUser.query()
      .where('organization_id', params.orgId)
      .where('external_id', externalId)
      .first()

    if (!endUser) {
      return response.notFound({ message: 'End user not found' })
    }

    setEndUserCookie(response, endUser.id, params.orgId)
    return response.ok({ data: { id: endUser.id, externalId: endUser.externalId } })
  }

  /** Cookie-based end-user resolution — enables cross-domain session sharing */
  async whoami({ params, request, response }: HttpContext) {
    const endUserId = readEndUserCookie(request)
    if (!endUserId) {
      return response.notFound({ message: 'No session cookie' })
    }

    const endUser = await EndUser.query()
      .where('id', endUserId)
      .where('organization_id', params.orgId)
      .first()

    if (!endUser) {
      return response.notFound({ message: 'End user not found' })
    }

    return response.ok({ data: { id: endUser.id } })
  }

  async publicStore({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createConversationValidator)

    // Cookie-based fallback: reuse end-user from cross-domain cookie
    if (!payload.endUserId) {
      const cookieEndUserId = readEndUserCookie(request)
      if (cookieEndUserId) {
        payload.endUserId = cookieEndUserId
      }
    }

    const conversation = await this.conversationService.publicCreate(params.orgId, {
      ...payload,
      attachments: payload.attachments,
      pageUrl: payload.pageUrl,
    })

    if (!conversation) {
      return response.notFound({ message: 'Organization not found' })
    }

    if (conversation.endUserId) {
      setEndUserCookie(response, conversation.endUserId, params.orgId)
    }
    return response.created({ data: conversation.serialize() })
  }

  async publicShow({ params, response }: HttpContext) {
    const result = await this.conversationService.publicShow(params.orgId, params.conversationId)

    if (!result) {
      return response.notFound({ message: 'Conversation not found' })
    }

    // messages already include sender info from service
    return response.ok({
      data: {
        ...result.conversation.serialize(),
        messages: result.messages,
      },
    })
  }

  async publicReply({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(publicReplyValidator)

    const message = await this.conversationService.publicReply(
      params.orgId,
      params.conversationId,
      payload,
    )

    if (!message) {
      return response.notFound({ message: 'Conversation not found' })
    }

    // Refresh cookie to extend expiry on every interaction
    const cookieEndUserId = readEndUserCookie(request)
    if (cookieEndUserId) {
      setEndUserCookie(response, cookieEndUserId, params.orgId)
    }

    return response.created({ data: message.serialize() })
  }

  async publicListByEndUser({ params, response }: HttpContext) {
    const conversations = await this.conversationService.publicListByEndUser(
      params.orgId,
      params.endUserId,
    )

    if (!conversations) {
      return response.notFound({ message: 'Organization not found' })
    }

    return response.ok({
      data: conversations.map((c) => {
        const serialized = c.serialize()
        const lastMsg = c.messages?.[0]
        serialized.lastMessagePreview = lastMsg?.body?.slice(0, 120) ?? null
        serialized.lastMessageSenderType = lastMsg?.senderType ?? null
        delete serialized.messages
        return serialized
      }),
    })
  }
}
