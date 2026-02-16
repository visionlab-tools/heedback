import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import Tag from '#models/tag'
import { createTagValidator, updateTagValidator } from '#validators/tag_validator'

export default class TagsController {
  /**
   * GET /api/v1/org/:orgSlug/tags
   * Lists all tags for the organization
   */
  async index({ organization, response }: HttpContext) {
    const tags = await Tag.query()
      .where('organization_id', organization.id)
      .withCount('posts')
      .orderBy('name', 'asc')

    return response.ok({
      data: tags.map((t) => ({
        ...t.serialize(),
        postCount: Number(t.$extras.posts_count),
      })),
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/tags
   * Creates a new tag
   */
  async store({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createTagValidator)

    const existing = await Tag.query()
      .where('organization_id', organization.id)
      .where('slug', payload.slug)
      .first()

    if (existing) {
      return response.conflict({ message: 'A tag with this slug already exists' })
    }

    const tag = await Tag.create({
      id: uuid(),
      organizationId: organization.id,
      name: payload.name,
      slug: payload.slug,
      color: payload.color ?? null,
    })

    return response.created({
      data: tag.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/tags/:tagId
   * Updates a tag
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateTagValidator)

    const tag = await Tag.query()
      .where('id', params.tagId)
      .where('organization_id', organization.id)
      .first()

    if (!tag) {
      return response.notFound({ message: 'Tag not found' })
    }

    if (payload.slug && payload.slug !== tag.slug) {
      const existing = await Tag.query()
        .where('organization_id', organization.id)
        .where('slug', payload.slug)
        .whereNot('id', tag.id)
        .first()

      if (existing) {
        return response.conflict({ message: 'A tag with this slug already exists' })
      }
    }

    tag.merge({
      name: payload.name ?? tag.name,
      slug: payload.slug ?? tag.slug,
      color: payload.color !== undefined ? payload.color : tag.color,
    })

    await tag.save()

    return response.ok({
      data: tag.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/tags/:tagId
   * Deletes a tag
   */
  async destroy({ organization, params, response }: HttpContext) {
    const tag = await Tag.query()
      .where('id', params.tagId)
      .where('organization_id', organization.id)
      .first()

    if (!tag) {
      return response.notFound({ message: 'Tag not found' })
    }

    await tag.delete()

    return response.ok({ message: 'Tag deleted successfully' })
  }
}
