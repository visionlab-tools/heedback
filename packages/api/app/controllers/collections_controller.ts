import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import Collection from '#models/collection'
import CollectionTranslation from '#models/collection_translation'
import {
  createCollectionValidator,
  updateCollectionValidator,
  reorderCollectionsValidator,
} from '#validators/collection_validator'

export default class CollectionsController {
  /**
   * GET /api/v1/org/:orgSlug/collections
   * Lists all collections for the organization
   */
  async index({ organization, response }: HttpContext) {
    const collections = await Collection.query()
      .where('organization_id', organization.id)
      .preload('translations')
      .preload('children', (query) => {
        query.preload('translations')
      })
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')

    return response.ok({
      data: collections.map((c) => c.serialize()),
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/collections
   * Creates a new collection with translations
   */
  async store({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createCollectionValidator)

    const existing = await Collection.query()
      .where('organization_id', organization.id)
      .where('slug', payload.slug)
      .first()

    if (existing) {
      return response.conflict({ message: 'A collection with this slug already exists' })
    }

    const collection = await Collection.create({
      id: uuid(),
      organizationId: organization.id,
      parentId: payload.parentId ?? null,
      slug: payload.slug,
      icon: payload.icon ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isPublished: payload.isPublished ?? false,
    })

    for (const t of payload.translations) {
      await CollectionTranslation.create({
        id: uuid(),
        collectionId: collection.id,
        locale: t.locale,
        name: t.name,
        description: t.description ?? null,
      })
    }

    await collection.load('translations')

    return response.created({
      data: collection.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/collections/:collectionId
   * Shows a single collection
   */
  async show({ organization, params, response }: HttpContext) {
    const collection = await Collection.query()
      .where('id', params.collectionId)
      .where('organization_id', organization.id)
      .preload('translations')
      .preload('articles', (query) => {
        query.preload('translations').orderBy('sort_order', 'asc')
      })
      .preload('children', (query) => {
        query.preload('translations').orderBy('sort_order', 'asc')
      })
      .first()

    if (!collection) {
      return response.notFound({ message: 'Collection not found' })
    }

    return response.ok({
      data: collection.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/collections/:collectionId
   * Updates a collection
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCollectionValidator)

    const collection = await Collection.query()
      .where('id', params.collectionId)
      .where('organization_id', organization.id)
      .first()

    if (!collection) {
      return response.notFound({ message: 'Collection not found' })
    }

    if (payload.slug && payload.slug !== collection.slug) {
      const existing = await Collection.query()
        .where('organization_id', organization.id)
        .where('slug', payload.slug)
        .whereNot('id', collection.id)
        .first()

      if (existing) {
        return response.conflict({ message: 'A collection with this slug already exists' })
      }
    }

    collection.merge({
      slug: payload.slug ?? collection.slug,
      parentId: payload.parentId !== undefined ? payload.parentId : collection.parentId,
      icon: payload.icon !== undefined ? payload.icon : collection.icon,
      sortOrder: payload.sortOrder ?? collection.sortOrder,
      isPublished: payload.isPublished ?? collection.isPublished,
    })

    await collection.save()

    if (payload.translations) {
      for (const t of payload.translations) {
        const existing = await CollectionTranslation.query()
          .where('collection_id', collection.id)
          .where('locale', t.locale)
          .first()

        if (existing) {
          existing.merge({
            name: t.name,
            description: t.description !== undefined ? t.description : existing.description,
          })
          await existing.save()
        } else {
          await CollectionTranslation.create({
            id: uuid(),
            collectionId: collection.id,
            locale: t.locale,
            name: t.name,
            description: t.description ?? null,
          })
        }
      }
    }

    await collection.load('translations')

    return response.ok({
      data: collection.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/collections/:collectionId
   * Deletes a collection
   */
  async destroy({ organization, params, response }: HttpContext) {
    const collection = await Collection.query()
      .where('id', params.collectionId)
      .where('organization_id', organization.id)
      .first()

    if (!collection) {
      return response.notFound({ message: 'Collection not found' })
    }

    await collection.delete()

    return response.ok({ message: 'Collection deleted successfully' })
  }

  /**
   * POST /api/v1/org/:orgSlug/collections/reorder
   * Reorders collections
   */
  async reorder({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(reorderCollectionsValidator)

    for (const item of payload.items) {
      await Collection.query()
        .where('id', item.id)
        .where('organization_id', organization.id)
        .update({ sort_order: item.sortOrder })
    }

    return response.ok({ message: 'Collections reordered successfully' })
  }

  /**
   * GET /api/v1/org/:orgSlug/public/collections
   * Public endpoint: lists published collections
   */
  async publicIndex({ params, response }: HttpContext) {
    const org = await (await import('#models/organization')).default
      .query()
      .where('slug', params.orgSlug)
      .first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const collections = await Collection.query()
      .where('organization_id', org.id)
      .where('is_published', true)
      .preload('translations')
      .preload('children', (query) => {
        query.where('is_published', true).preload('translations')
      })
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')

    return response.ok({
      data: collections.map((c) => c.serialize()),
    })
  }
}
