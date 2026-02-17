import type { HttpContext } from '@adonisjs/core/http'
import { createTagValidator, updateTagValidator } from '#validators/tag_validator'
import TagService from '#services/tag_service'

export default class TagsController {
  private tagService = new TagService()

  async index({ organization, response }: HttpContext) {
    const data = await this.tagService.list(organization.id)

    return response.ok({ data })
  }

  async store({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createTagValidator)

    try {
      const tag = await this.tagService.create(organization.id, payload)
      return response.created({ data: tag.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateTagValidator)

    try {
      const tag = await this.tagService.update(organization.id, params.tagId, payload)

      if (!tag) {
        return response.notFound({ message: 'Tag not found' })
      }

      return response.ok({ data: tag.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async destroy({ organization, params, response }: HttpContext) {
    const result = await this.tagService.delete(organization.id, params.tagId)

    if (!result) {
      return response.notFound({ message: 'Tag not found' })
    }

    return response.ok({ message: 'Tag deleted successfully' })
  }
}
