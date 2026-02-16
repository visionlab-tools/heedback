import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import Post from '#models/post'
import Comment from '#models/comment'
import { createCommentValidator, updateCommentValidator } from '#validators/comment_validator'

export default class CommentsController {
  /**
   * GET /api/v1/org/:orgSlug/posts/:postId/comments
   * Lists comments for a post
   */
  async index({ organization, params, response }: HttpContext) {
    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    const comments = await Comment.query()
      .where('post_id', post.id)
      .whereNull('parent_id')
      .preload('endUser')
      .preload('adminUser')
      .preload('replies', (query) => {
        query.preload('endUser').preload('adminUser').orderBy('created_at', 'asc')
      })
      .orderBy('created_at', 'asc')

    return response.ok({
      data: comments.map((c) => c.serialize()),
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/posts/:postId/comments
   * Creates a new comment on a post
   */
  async store({ organization, params, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createCommentValidator)
    const user = auth.user!

    const post = await Post.query()
      .where('id', params.postId)
      .where('organization_id', organization.id)
      .first()

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    if (payload.parentId) {
      const parentComment = await Comment.query()
        .where('id', payload.parentId)
        .where('post_id', post.id)
        .first()

      if (!parentComment) {
        return response.notFound({ message: 'Parent comment not found' })
      }
    }

    const comment = await Comment.create({
      id: uuid(),
      postId: post.id,
      parentId: payload.parentId ?? null,
      adminUserId: user.id,
      body: payload.body,
      isInternal: payload.isInternal ?? false,
    })

    post.commentCount = post.commentCount + 1
    await post.save()

    await comment.load('adminUser')

    return response.created({
      data: comment.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/comments/:commentId
   * Updates a comment
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCommentValidator)

    const comment = await Comment.query()
      .where('id', params.commentId)
      .whereHas('post', (postQuery) => {
        postQuery.where('organization_id', organization.id)
      })
      .first()

    if (!comment) {
      return response.notFound({ message: 'Comment not found' })
    }

    comment.body = payload.body
    await comment.save()

    await comment.load('adminUser')
    await comment.load('endUser')

    return response.ok({
      data: comment.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/comments/:commentId
   * Deletes a comment
   */
  async destroy({ organization, params, response }: HttpContext) {
    const comment = await Comment.query()
      .where('id', params.commentId)
      .whereHas('post', (postQuery) => {
        postQuery.where('organization_id', organization.id)
      })
      .first()

    if (!comment) {
      return response.notFound({ message: 'Comment not found' })
    }

    const post = await Post.find(comment.postId)
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1)
      await post.save()
    }

    await comment.delete()

    return response.ok({ message: 'Comment deleted successfully' })
  }
}
