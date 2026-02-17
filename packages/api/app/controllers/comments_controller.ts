import type { HttpContext } from '@adonisjs/core/http'
import { createCommentValidator, updateCommentValidator } from '#validators/comment_validator'
import CommentService from '#services/comment_service'

export default class CommentsController {
  private commentService = new CommentService()

  async index({ organization, params, response }: HttpContext) {
    const comments = await this.commentService.list(organization.id, params.postId)

    if (!comments) {
      return response.notFound({ message: 'Post not found' })
    }

    return response.ok({
      data: comments.map((c) => c.serialize()),
    })
  }

  async store({ organization, params, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createCommentValidator)

    try {
      const comment = await this.commentService.create(
        organization.id,
        params.postId,
        auth.user!.id,
        payload,
      )

      if (!comment) {
        return response.notFound({ message: 'Post not found' })
      }

      return response.created({ data: comment.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Parent comment not found')) {
        return response.notFound({ message: e.message })
      }
      throw e
    }
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCommentValidator)

    const comment = await this.commentService.update(organization.id, params.commentId, payload)

    if (!comment) {
      return response.notFound({ message: 'Comment not found' })
    }

    return response.ok({ data: comment.serialize() })
  }

  async destroy({ organization, params, response }: HttpContext) {
    const result = await this.commentService.delete(organization.id, params.commentId)

    if (!result) {
      return response.notFound({ message: 'Comment not found' })
    }

    return response.ok({ message: 'Comment deleted successfully' })
  }
}
