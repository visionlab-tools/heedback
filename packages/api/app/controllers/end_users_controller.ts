import type { HttpContext } from '@adonisjs/core/http'
import EndUser from '#models/end_user'

export default class EndUsersController {
  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()
    const page = Number(qs.page) || 1
    const limit = Number(qs.limit) || 20
    const search = qs.search?.trim()

    const query = EndUser.query()
      .where('organizationId', organization.id)
      .withCount('conversations')
      .orderBy('created_at', 'desc')

    if (search) {
      query.where((q) => {
        q.whereILike('email', `%${search}%`)
          .orWhereILike('first_name', `%${search}%`)
          .orWhereILike('last_name', `%${search}%`)
      })
    }

    const endUsers = await query.paginate(page, limit)
    return response.ok(endUsers.serialize())
  }

  async show({ organization, params, response }: HttpContext) {
    const endUser = await EndUser.query()
      .where('organizationId', organization.id)
      .where('id', params.id)
      .first()

    if (!endUser) {
      return response.notFound({ message: 'End user not found' })
    }

    const conversations = await endUser
      .related('conversations')
      .query()
      .orderBy('created_at', 'desc')
      .select(['id', 'subject', 'status', 'channel', 'messageCount', 'createdAt'])

    return response.ok({
      data: {
        ...endUser.serialize(),
        conversations: conversations.map((c) => c.serialize()),
      },
    })
  }
}
