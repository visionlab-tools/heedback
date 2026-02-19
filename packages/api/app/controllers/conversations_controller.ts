import type { HttpContext } from '@adonisjs/core/http'
import {
  createConversationValidator,
  sendMessageValidator,
  updateConversationValidator,
} from '#validators/conversation_validator'
import ConversationService from '#services/conversation_service'

export default class ConversationsController {
  private conversationService = new ConversationService()

  async index({ organization, request, response }: HttpContext) {
    const conversations = await this.conversationService.list(organization.id, {
      page: request.input('page', 1),
      limit: request.input('limit', 20),
      status: request.input('status'),
      assignedToId: request.input('assignedToId'),
    })

    return response.ok({
      data: conversations.all().map((c) => c.serialize()),
      meta: conversations.getMeta(),
    })
  }

  async show({ organization, params, response }: HttpContext) {
    const result = await this.conversationService.show(organization.id, params.conversationId)

    if (!result) {
      return response.notFound({ message: 'Conversation not found' })
    }

    return response.ok({
      data: {
        ...result.conversation.serialize(),
        messages: result.messages.map((m) => m.serialize()),
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
      payload,
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

  async publicStore({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createConversationValidator)

    const conversation = await this.conversationService.publicCreate(params.orgId, payload)

    if (!conversation) {
      return response.notFound({ message: 'Organization not found' })
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
    const payload = await request.validateUsing(sendMessageValidator)

    const message = await this.conversationService.publicReply(
      params.orgId,
      params.conversationId,
      payload,
    )

    if (!message) {
      return response.notFound({ message: 'Conversation not found' })
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

    return response.ok({ data: conversations.map((c) => c.serialize()) })
  }
}
