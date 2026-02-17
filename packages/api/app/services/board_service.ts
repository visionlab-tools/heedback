import { v4 as uuid } from 'uuid'
import Board from '#models/board'

interface PaginationOpts {
  page?: number
  limit?: number
  sortBy?: string
}

export default class BoardService {
  /**
   * List boards for an organization with post counts.
   */
  async list(orgId: string): Promise<Board[]> {
    return Board.query()
      .where('organization_id', orgId)
      .withCount('posts')
      .orderBy('sort_order', 'asc')
  }

  /**
   * Create a new board.
   * Throws if the slug already exists within the organization.
   */
  async create(
    orgId: string,
    data: {
      name: string
      slug: string
      description?: string | null
      color?: string | null
      isPublic?: boolean
      sortOrder?: number
    },
  ): Promise<Board> {
    const existing = await Board.query()
      .where('organization_id', orgId)
      .where('slug', data.slug)
      .first()

    if (existing) {
      throw new Error('A board with this slug already exists')
    }

    return Board.create({
      id: uuid(),
      organizationId: orgId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      color: data.color ?? null,
      isPublic: data.isPublic ?? true,
      sortOrder: data.sortOrder ?? 0,
    })
  }

  /**
   * Show a single board with paginated posts.
   * Returns null if the board is not found.
   */
  async show(orgId: string, boardId: string, paginationOpts: PaginationOpts = {}) {
    const board = await Board.query()
      .where('id', boardId)
      .where('organization_id', orgId)
      .first()

    if (!board) {
      return null
    }

    const page = paginationOpts.page || 1
    const limit = Math.min(paginationOpts.limit || 20, 100)
    const sortBy = paginationOpts.sortBy === 'recent' ? 'created_at' : 'vote_count'

    const posts = await board
      .related('posts')
      .query()
      .preload('tags')
      .preload('endUser')
      .orderBy(sortBy, 'desc')
      .paginate(page, limit)

    return { board, posts }
  }

  /**
   * Update a board.
   * Returns null if the board is not found.
   * Throws if the new slug conflicts with another board in the org.
   */
  async update(
    orgId: string,
    boardId: string,
    data: {
      name?: string
      slug?: string
      description?: string | null
      color?: string | null
      isPublic?: boolean
      sortOrder?: number
    },
  ): Promise<Board | null> {
    const board = await Board.query()
      .where('id', boardId)
      .where('organization_id', orgId)
      .first()

    if (!board) {
      return null
    }

    if (data.slug && data.slug !== board.slug) {
      const existing = await Board.query()
        .where('organization_id', orgId)
        .where('slug', data.slug)
        .whereNot('id', board.id)
        .first()

      if (existing) {
        throw new Error('A board with this slug already exists')
      }
    }

    board.merge({
      name: data.name ?? board.name,
      slug: data.slug ?? board.slug,
      description: data.description !== undefined ? data.description : board.description,
      color: data.color !== undefined ? data.color : board.color,
      isPublic: data.isPublic ?? board.isPublic,
      sortOrder: data.sortOrder ?? board.sortOrder,
    })

    await board.save()

    return board
  }

  /**
   * Delete a board.
   * Returns null if the board is not found.
   */
  async delete(orgId: string, boardId: string): Promise<Board | null> {
    const board = await Board.query()
      .where('id', boardId)
      .where('organization_id', orgId)
      .first()

    if (!board) {
      return null
    }

    await board.delete()

    return board
  }
}
