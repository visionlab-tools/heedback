import { v4 as uuid } from 'uuid'
import Collection from '#models/collection'
import CollectionTranslation from '#models/collection_translation'

export default class CollectionService {
  /**
   * List root collections with translations and children for an organization.
   */
  async list(orgId: string): Promise<Collection[]> {
    return Collection.query()
      .where('organization_id', orgId)
      .preload('translations')
      .preload('children', (query) => {
        query.preload('translations')
      })
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')
  }

  /**
   * Create a new collection with translations.
   * Throws if the slug already exists within the organization.
   */
  async create(
    orgId: string,
    data: {
      slug: string
      parentId?: string | null
      icon?: string | null
      sortOrder?: number
      isPublished?: boolean
      translations: Array<{
        locale: string
        name: string
        description?: string | null
      }>
    },
  ): Promise<Collection> {
    const existing = await Collection.query()
      .where('organization_id', orgId)
      .where('slug', data.slug)
      .first()

    if (existing) {
      throw new Error('A collection with this slug already exists')
    }

    const collection = await Collection.create({
      id: uuid(),
      organizationId: orgId,
      parentId: data.parentId ?? null,
      slug: data.slug,
      icon: data.icon ?? null,
      sortOrder: data.sortOrder ?? 0,
      isPublished: data.isPublished ?? false,
    })

    for (const t of data.translations) {
      await CollectionTranslation.create({
        id: uuid(),
        collectionId: collection.id,
        locale: t.locale,
        name: t.name,
        description: t.description ?? null,
      })
    }

    await collection.load('translations')

    return collection
  }

  /**
   * Show a single collection with translations, articles, and children.
   * Returns null if not found.
   */
  async show(orgId: string, collectionId: string): Promise<Collection | null> {
    return Collection.query()
      .where('id', collectionId)
      .where('organization_id', orgId)
      .preload('translations')
      .preload('articles', (query) => {
        query.preload('translations').orderBy('sort_order', 'asc')
      })
      .preload('children', (query) => {
        query.preload('translations').orderBy('sort_order', 'asc')
      })
      .first()
  }

  /**
   * Update a collection and upsert translations.
   * Returns null if the collection is not found.
   * Throws if the new slug conflicts with another collection in the org.
   */
  async update(
    orgId: string,
    collectionId: string,
    data: {
      slug?: string
      parentId?: string | null
      icon?: string | null
      sortOrder?: number
      isPublished?: boolean
      translations?: Array<{
        locale: string
        name: string
        description?: string | null
      }>
    },
  ): Promise<Collection | null> {
    const collection = await Collection.query()
      .where('id', collectionId)
      .where('organization_id', orgId)
      .first()

    if (!collection) {
      return null
    }

    if (data.slug && data.slug !== collection.slug) {
      const existing = await Collection.query()
        .where('organization_id', orgId)
        .where('slug', data.slug)
        .whereNot('id', collection.id)
        .first()

      if (existing) {
        throw new Error('A collection with this slug already exists')
      }
    }

    collection.merge({
      slug: data.slug ?? collection.slug,
      parentId: data.parentId !== undefined ? data.parentId : collection.parentId,
      icon: data.icon !== undefined ? data.icon : collection.icon,
      sortOrder: data.sortOrder ?? collection.sortOrder,
      isPublished: data.isPublished ?? collection.isPublished,
    })

    await collection.save()

    if (data.translations) {
      for (const t of data.translations) {
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

    return collection
  }

  /**
   * Delete a collection.
   * Returns null if the collection is not found.
   */
  async delete(orgId: string, collectionId: string): Promise<Collection | null> {
    const collection = await Collection.query()
      .where('id', collectionId)
      .where('organization_id', orgId)
      .first()

    if (!collection) {
      return null
    }

    await collection.delete()

    return collection
  }

  /**
   * Batch update sort_order for collections.
   */
  async reorder(orgId: string, items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    for (const item of items) {
      await Collection.query()
        .where('id', item.id)
        .where('organization_id', orgId)
        .update({ sort_order: item.sortOrder })
    }
  }

  /**
   * List published root collections for an organization (public endpoint).
   * When locale is provided, only returns translations matching that locale.
   */
  async listPublished(orgId: string, locale?: string): Promise<Collection[]> {
    return Collection.query()
      .where('organization_id', orgId)
      .where('is_published', true)
      .preload('translations', (q) => {
        if (locale) q.where('locale', locale)
      })
      .preload('children', (query) => {
        query.where('is_published', true).preload('translations', (q) => {
          if (locale) q.where('locale', locale)
        })
      })
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')
  }
}
