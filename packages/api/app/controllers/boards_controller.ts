import type { HttpContext } from '@adonisjs/core/http'
import { createBoardValidator, updateBoardValidator } from '#validators/board_validator'
import BoardService from '#services/board_service'

export default class BoardsController {
  private boardService = new BoardService()

  async index({ organization, response }: HttpContext) {
    const boards = await this.boardService.list(organization.id)

    return response.ok({
      data: boards.map((b) => ({
        ...b.serialize(),
        postCount: Number(b.$extras.posts_count),
      })),
    })
  }

  async store({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createBoardValidator)

    try {
      const board = await this.boardService.create(organization.id, payload)
      return response.created({ data: board.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async show({ organization, params, request, response }: HttpContext) {
    const qs = request.qs()

    const result = await this.boardService.show(organization.id, params.boardId, {
      page: Number(qs.page) || 1,
      limit: Number(qs.limit) || 20,
      sortBy: qs.sortBy,
    })

    if (!result) {
      return response.notFound({ message: 'Board not found' })
    }

    return response.ok({
      board: result.board.serialize(),
      posts: result.posts.serialize(),
    })
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateBoardValidator)

    try {
      const board = await this.boardService.update(organization.id, params.boardId, payload)

      if (!board) {
        return response.notFound({ message: 'Board not found' })
      }

      return response.ok({ data: board.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async destroy({ organization, params, response }: HttpContext) {
    const board = await this.boardService.delete(organization.id, params.boardId)

    if (!board) {
      return response.notFound({ message: 'Board not found' })
    }

    return response.ok({ message: 'Board deleted successfully' })
  }
}
