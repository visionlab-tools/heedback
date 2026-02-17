import type { HttpContext } from '@adonisjs/core/http'
import {
  createChangelogEntryValidator,
  updateChangelogEntryValidator,
  subscribeChangelogValidator,
} from '#validators/changelog_validator'
import ChangelogService from '#services/changelog_service'

export default class ChangelogController {
  private changelogService = new ChangelogService()

  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()

    const entries = await this.changelogService.list(organization.id, {
      page: Number(qs.page) || 1,
      limit: Number(qs.limit) || 20,
      status: qs.status,
    })

    return response.ok(entries.serialize())
  }

  async store({ organization, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createChangelogEntryValidator)

    try {
      const entry = await this.changelogService.create(organization.id, auth.user!.id, payload)
      return response.created({ data: entry.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async show({ organization, params, response }: HttpContext) {
    const entry = await this.changelogService.show(organization.id, params.entryId)

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    return response.ok({ data: entry.serialize() })
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateChangelogEntryValidator)

    try {
      const entry = await this.changelogService.update(organization.id, params.entryId, payload)

      if (!entry) {
        return response.notFound({ message: 'Changelog entry not found' })
      }

      return response.ok({ data: entry.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async destroy({ organization, params, response }: HttpContext) {
    const result = await this.changelogService.delete(organization.id, params.entryId)

    if (!result) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    return response.ok({ message: 'Changelog entry deleted successfully' })
  }

  async publish({ organization, params, response }: HttpContext) {
    try {
      const entry = await this.changelogService.publish(organization.id, params.entryId)

      if (!entry) {
        return response.notFound({ message: 'Changelog entry not found' })
      }

      return response.ok({
        data: entry.serialize(),
        message: 'Changelog entry published successfully',
      })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('already published')) {
        return response.badRequest({ message: e.message })
      }
      throw e
    }
  }

  async subscribe({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(subscribeChangelogValidator)

    const result = await this.changelogService.subscribe(params.orgSlug, payload.email)

    if (!result) {
      return response.notFound({ message: 'Organization not found' })
    }

    if (result.alreadySubscribed) {
      return response.ok({ message: 'Already subscribed' })
    }

    return response.created({ message: 'Subscribed to changelog updates' })
  }

  async unsubscribe({ params, response }: HttpContext) {
    try {
      const result = await this.changelogService.unsubscribe(params.orgSlug, params.email)

      if (!result) {
        return response.notFound({ message: 'Organization not found' })
      }

      return response.ok({ message: 'Unsubscribed successfully' })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Subscriber not found')) {
        return response.notFound({ message: e.message })
      }
      throw e
    }
  }

  async publicIndex({ params, request, response }: HttpContext) {
    const qs = request.qs()

    const entries = await this.changelogService.listPublished(
      params.orgSlug,
      Number(qs.page) || 1,
      Number(qs.limit) || 20,
      qs.locale as string | undefined,
    )

    if (!entries) {
      return response.notFound({ message: 'Organization not found' })
    }

    return response.ok(entries.serialize())
  }

  async publicShow({ params, request, response }: HttpContext) {
    const locale = request.qs().locale as string | undefined
    const entry = await this.changelogService.showPublished(params.orgSlug, params.entryId, locale)

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    return response.ok({ data: entry.serialize() })
  }
}
