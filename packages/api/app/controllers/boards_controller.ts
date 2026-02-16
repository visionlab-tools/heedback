import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import Board from '#models/board'
import { createBoardValidator, updateBoardValidator } from '#validators/board_validator'

export default class BoardsController {
  /**
   * GET /api/v1/org/:orgSlug/boards
   * Lists all boards for the organization
   */
  async index({ organization, response }: HttpContext) {
    const boards = await Board.query()
      .where('organization_id', organization.id)
      .withCount('posts')
      .orderBy('sort_order', 'asc')

    return response.ok({
      data: boards.map((b) => ({
        ...b.serialize(),
        postCount: Number(b.$extras.posts_count),
      })),
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/boards
   * Creates a new board
   */
  async store({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createBoardValidator)

    const existing = await Board.query()
      .where('organization_id', organization.id)
      .where('slug', payload.slug)
      .first()

    if (existing) {
      return response.conflict({ message: 'A board with this slug already exists' })
    }

    const board = await Board.create({
      id: uuid(),
      organizationId: organization.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      color: payload.color ?? null,
      isPublic: payload.isPublic ?? true,
      sortOrder: payload.sortOrder ?? 0,
    })

    return response.created({
      data: board.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/boards/:boardId
   * Shows a single board with its posts
   */
  async show({ organization, params, request, response }: HttpContext) {
    const qs = request.qs()

    const board = await Board.query()
      .where('id', params.boardId)
      .where('organization_id', organization.id)
      .first()

    if (!board) {
      return response.notFound({ message: 'Board not found' })
    }

    const page = Number(qs.page) || 1
    const limit = Math.min(Number(qs.limit) || 20, 100)
    const sortBy = qs.sortBy === 'recent' ? 'created_at' : 'vote_count'

    const posts = await board
      .related('posts')
      .query()
      .preload('tags')
      .preload('endUser')
      .orderBy(sortBy, 'desc')
      .paginate(page, limit)

    return response.ok({
      board: board.serialize(),
      posts: posts.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/boards/:boardId
   * Updates a board
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateBoardValidator)

    const board = await Board.query()
      .where('id', params.boardId)
      .where('organization_id', organization.id)
      .first()

    if (!board) {
      return response.notFound({ message: 'Board not found' })
    }

    if (payload.slug && payload.slug !== board.slug) {
      const existing = await Board.query()
        .where('organization_id', organization.id)
        .where('slug', payload.slug)
        .whereNot('id', board.id)
        .first()

      if (existing) {
        return response.conflict({ message: 'A board with this slug already exists' })
      }
    }

    board.merge({
      name: payload.name ?? board.name,
      slug: payload.slug ?? board.slug,
      description: payload.description !== undefined ? payload.description : board.description,
      color: payload.color !== undefined ? payload.color : board.color,
      isPublic: payload.isPublic ?? board.isPublic,
      sortOrder: payload.sortOrder ?? board.sortOrder,
    })

    await board.save()

    return response.ok({
      data: board.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/boards/:boardId
   * Deletes a board
   */
  async destroy({ organization, params, response }: HttpContext) {
    const board = await Board.query()
      .where('id', params.boardId)
      .where('organization_id', organization.id)
      .first()

    if (!board) {
      return response.notFound({ message: 'Board not found' })
    }

    await board.delete()

    return response.ok({ message: 'Board deleted successfully' })
  }
}
