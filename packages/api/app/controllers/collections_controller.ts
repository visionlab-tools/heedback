import type { HttpContext } from '@adonisjs/core/http'
import {
  createCollectionValidator,
  updateCollectionValidator,
  reorderCollectionsValidator,
} from '#validators/collection_validator'
import CollectionService from '#services/collection_service'
import Organization from '#models/organization'

export default class CollectionsController {
  private collectionService = new CollectionService()

  async index({ organization, response }: HttpContext) {
    const collections = await this.collectionService.list(organization.id)

    return response.ok({
      data: collections.map((c) => c.serialize()),
    })
  }

  async store({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createCollectionValidator)

    try {
      const collection = await this.collectionService.create(organization.id, payload)
      return response.created({ data: collection.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async show({ organization, params, response }: HttpContext) {
    const collection = await this.collectionService.show(organization.id, params.collectionId)

    if (!collection) {
      return response.notFound({ message: 'Collection not found' })
    }

    return response.ok({ data: collection.serialize() })
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCollectionValidator)

    try {
      const collection = await this.collectionService.update(organization.id, params.collectionId, payload)

      if (!collection) {
        return response.notFound({ message: 'Collection not found' })
      }

      return response.ok({ data: collection.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async destroy({ organization, params, response }: HttpContext) {
    const collection = await this.collectionService.delete(organization.id, params.collectionId)

    if (!collection) {
      return response.notFound({ message: 'Collection not found' })
    }

    return response.ok({ message: 'Collection deleted successfully' })
  }

  async reorder({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(reorderCollectionsValidator)

    await this.collectionService.reorder(organization.id, payload.items)

    return response.ok({ message: 'Collections reordered successfully' })
  }

  async publicIndex({ params, request, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgId).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const locale = request.qs().locale as string | undefined
    const collections = await this.collectionService.listPublished(org.id, locale)

    return response.ok({
      data: collections.map((c) => c.serialize()),
    })
  }
}
