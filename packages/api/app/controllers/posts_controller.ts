import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import Post from '#models/post'
import Vote from '#models/vote'
import {
  createPostValidator,
  updatePostValidator,
  mergePostValidator,
} from '#validators/post_validator'

export default class PostsController {
  /**
   * GET /api/v1/org/:orgSlug/posts
   * Lists posts for the organization with filtering/sorting
   */
  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()

    const query = Post.query()
      .where('organization_id', organization.id)
      .whereNull('merged_into_id')
      .preload('tags')
      .preload('endUser')
      .preload('board')

    if (qs.boardId) {
      query.where('board_id', qs.boardId)
    }

    if (qs.status) {
      query.where('status', qs.status)
    }

    if (qs.tagId) {
      query.whereHas('tags', (tagQuery) => {
        tagQuery.where('tags.id', qs.tagId)
      })
    }

    const page = Number(qs.page) || 1
    const limit = Math.min(Number(qs.limit) || 20, 100)
    const sortBy = qs.sortBy === 'recent' ? 'created_at' : 'vote_count'

    const posts = await query.orderBy(sortBy, 'desc').paginate(page, limit)

    return response.ok(posts.serialize())
  }

  /**
   * POST /api/v1/org/:orgSlug/posts
   * Creates a new post
   */
  async store({ organization, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    const user = auth.user!

    const post = await Post.create({
      id: uuid(),
      organizationId: organization.id,
      boardId: payload.boardId,
      adminUserId: user.id,
      title: payload.title,
      body: payload.body ?? null,
      status: payload.status ?? 'open',
      voteCount: 0,
      commentCount: 0,
      eta: payload.eta ?? null,
    })

    if (payload.tagIds && payload.tagIds.length > 0) {
      await post.related('tags').attach(payload.tagIds)
    }

    await post.load('tags')
    await post.load('board')

    return response.created({
      data: post.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/posts/:postId
   * Shows a single post with details
   */
  async show({ organization, params, response }: HttpContext) {
    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .preload('tags')
      .preload('board')
      .preload('endUser')
      .preload('adminUser')
      .preload('mergedPosts')
      .preload('votes')
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    return response.ok({
      data: post.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/posts/:postId
   * Updates a post
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePostValidator)

    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    post.merge({
      boardId: payload.boardId ?? post.boardId,
      title: payload.title ?? post.title,
      body: payload.body !== undefined ? payload.body : post.body,
      status: payload.status ?? post.status,
      eta: payload.eta !== undefined ? payload.eta : post.eta,
    })

    await post.save()

    if (payload.tagIds !== undefined) {
      await post.related('tags').sync(payload.tagIds)
    }

    await post.load('tags')
    await post.load('board')

    return response.ok({
      data: post.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/posts/:postId
   * Deletes a post
   */
  async destroy({ organization, params, response }: HttpContext) {
    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    await post.delete()

    return response.ok({ message: 'Post deleted successfully' })
  }

  /**
   * POST /api/v1/org/:orgSlug/posts/:postId/vote
   * Adds a vote from the authenticated admin user
   */
  async vote({ organization, params, auth, response }: HttpContext) {
    const user = auth.user!

    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    const existingVote = await Vote.query()
      .where('post_id', post.id)
      .where('admin_user_id', user.id)
      .first()

    if (existingVote) {
      return response.conflict({ message: 'You have already voted on this post' })
    }

    await Vote.create({
      id: uuid(),
      postId: post.id,
      adminUserId: user.id,
    })

    post.voteCount = post.voteCount + 1
    await post.save()

    return response.created({
      data: { voteCount: post.voteCount },
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/posts/:postId/vote
   * Removes a vote from the authenticated admin user
   */
  async unvote({ organization, params, auth, response }: HttpContext) {
    const user = auth.user!

    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    const vote = await Vote.query()
      .where('post_id', post.id)
      .where('admin_user_id', user.id)
      .first()

    if (!vote) {
      return response.notFound({ message: 'Vote not found' })
    }

    await vote.delete()

    post.voteCount = Math.max(0, post.voteCount - 1)
    await post.save()

    return response.ok({
      data: { voteCount: post.voteCount },
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/posts/:postId/merge
   * Merges the current post into a target post
   */
  async merge({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(mergePostValidator)

    const sourcePost = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!sourcePost) {
      return response.notFound({ message: 'Source post not found' })
    }

    const targetPost = await Post.query()
      .where('id', payload.targetPostId)
      .where('organization_id', organization.id)
      .first()

    if (!targetPost) {
      return response.notFound({ message: 'Target post not found' })
    }

    if (sourcePost.id === targetPost.id) {
      return response.badRequest({ message: 'Cannot merge a post into itself' })
    }

    sourcePost.mergedIntoId = targetPost.id
    sourcePost.status = 'closed'
    await sourcePost.save()

    targetPost.voteCount = targetPost.voteCount + sourcePost.voteCount
    await targetPost.save()

    return response.ok({
      data: targetPost.serialize(),
      message: 'Post merged successfully',
    })
  }
}
