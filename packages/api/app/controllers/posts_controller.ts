import type { HttpContext } from '@adonisjs/core/http'
import {
  createPostValidator,
  updatePostValidator,
  mergePostValidator,
} from '#validators/post_validator'
import PostService from '#services/post_service'

export default class PostsController {
  private postService = new PostService()

  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()

    const posts = await this.postService.list(organization.id, {
      boardId: qs.boardId,
      status: qs.status,
      tagId: qs.tagId,
      page: Number(qs.page) || 1,
      limit: Number(qs.limit) || 20,
      sortBy: qs.sortBy,
    })

    return response.ok(posts.serialize())
  }

  async store({ organization, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)

    const post = await this.postService.create(organization.id, auth.user!.id, payload)

    return response.created({ data: post.serialize() })
  }

  async show({ organization, params, response }: HttpContext) {
    const post = await this.postService.show(organization.id, params.postId)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    return response.ok({ data: post.serialize() })
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePostValidator)

    const post = await this.postService.update(organization.id, params.postId, payload)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    return response.ok({ data: post.serialize() })
  }

  async destroy({ organization, params, response }: HttpContext) {
    const post = await this.postService.delete(organization.id, params.postId)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    return response.ok({ message: 'Post deleted successfully' })
  }

  async vote({ organization, params, auth, response }: HttpContext) {
    try {
      const result = await this.postService.vote(params.postId, organization.id, auth.user!.id)

      if (!result) {
        return response.notFound({ message: 'Post not found' })
      }

      return response.created({ data: { voteCount: result.voteCount } })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('already voted')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async unvote({ organization, params, auth, response }: HttpContext) {
    const result = await this.postService.unvote(params.postId, organization.id, auth.user!.id)

    if (!result) {
      return response.notFound({ message: 'Vote not found' })
    }

    return response.ok({ data: { voteCount: result.voteCount } })
  }

  async merge({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(mergePostValidator)

    try {
      const result = await this.postService.merge(organization.id, params.postId, payload.targetPostId)

      if (!result) {
        return response.notFound({ message: 'Post not found' })
      }

      return response.ok({
        data: result.targetPost.serialize(),
        message: 'Post merged successfully',
      })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Cannot merge')) {
        return response.badRequest({ message: e.message })
      }
      throw e
    }
  }
}
