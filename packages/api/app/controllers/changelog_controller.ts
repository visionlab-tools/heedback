import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import ChangelogEntry from '#models/changelog_entry'
import ChangelogEntryTranslation from '#models/changelog_entry_translation'
import ChangelogSubscriber from '#models/changelog_subscriber'
import Organization from '#models/organization'
import {
  createChangelogEntryValidator,
  updateChangelogEntryValidator,
  subscribeChangelogValidator,
} from '#validators/changelog_validator'

export default class ChangelogController {
  /**
   * GET /api/v1/org/:orgSlug/changelog
   * Lists all changelog entries (admin view)
   */
  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()
    const page = Number(qs.page) || 1
    const limit = Math.min(Number(qs.limit) || 20, 100)

    const query = ChangelogEntry.query()
      .where('organization_id', organization.id)
      .preload('translations')
      .preload('author')
      .preload('linkedPosts')

    if (qs.status) {
      query.where('status', qs.status)
    }

    const entries = await query.orderBy('created_at', 'desc').paginate(page, limit)

    return response.ok(entries.serialize())
  }

  /**
   * POST /api/v1/org/:orgSlug/changelog
   * Creates a new changelog entry
   */
  async store({ organization, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createChangelogEntryValidator)
    const user = auth.user!

    const existing = await ChangelogEntry.query()
      .where('organization_id', organization.id)
      .where('slug', payload.slug)
      .first()

    if (existing) {
      return response.conflict({ message: 'A changelog entry with this slug already exists' })
    }

    const entry = await ChangelogEntry.create({
      id: uuid(),
      organizationId: organization.id,
      authorId: user.id,
      slug: payload.slug,
      coverImageUrl: payload.coverImageUrl ?? null,
      status: payload.status ?? 'draft',
      labels: payload.labels ?? null,
      scheduledAt: payload.scheduledAt ? DateTime.fromISO(payload.scheduledAt) : null,
      publishedAt: payload.status === 'published' ? DateTime.now() : null,
    })

    for (const t of payload.translations) {
      await ChangelogEntryTranslation.create({
        id: uuid(),
        changelogEntryId: entry.id,
        locale: t.locale,
        title: t.title,
        body: t.body ?? null,
        excerpt: t.excerpt ?? null,
      })
    }

    if (payload.linkedPostIds && payload.linkedPostIds.length > 0) {
      await entry.related('linkedPosts').attach(payload.linkedPostIds)
    }

    await entry.load('translations')
    await entry.load('author')

    return response.created({
      data: entry.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/changelog/:entryId
   * Shows a single changelog entry (admin view)
   */
  async show({ organization, params, response }: HttpContext) {
    const entry = await ChangelogEntry.query()
      .where('id', params.entryId)
      .where('organization_id', organization.id)
      .preload('translations')
      .preload('author')
      .preload('linkedPosts')
      .first()

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    return response.ok({
      data: entry.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/changelog/:entryId
   * Updates a changelog entry
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateChangelogEntryValidator)

    const entry = await ChangelogEntry.query()
      .where('id', params.entryId)
      .where('organization_id', organization.id)
      .first()

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    if (payload.slug && payload.slug !== entry.slug) {
      const existing = await ChangelogEntry.query()
        .where('organization_id', organization.id)
        .where('slug', payload.slug)
        .whereNot('id', entry.id)
        .first()

      if (existing) {
        return response.conflict({ message: 'A changelog entry with this slug already exists' })
      }
    }

    const wasPublished = entry.status === 'published'
    const willPublish = payload.status === 'published'

    entry.merge({
      slug: payload.slug ?? entry.slug,
      coverImageUrl:
        payload.coverImageUrl !== undefined ? payload.coverImageUrl : entry.coverImageUrl,
      status: payload.status ?? entry.status,
      labels: payload.labels !== undefined ? payload.labels : entry.labels,
      scheduledAt:
        payload.scheduledAt !== undefined
          ? payload.scheduledAt
            ? DateTime.fromISO(payload.scheduledAt)
            : null
          : entry.scheduledAt,
      publishedAt: !wasPublished && willPublish ? DateTime.now() : entry.publishedAt,
    })

    await entry.save()

    if (payload.translations) {
      for (const t of payload.translations) {
        const existing = await ChangelogEntryTranslation.query()
          .where('changelog_entry_id', entry.id)
          .where('locale', t.locale)
          .first()

        if (existing) {
          existing.merge({
            title: t.title,
            body: t.body !== undefined ? t.body : existing.body,
            excerpt: t.excerpt !== undefined ? t.excerpt : existing.excerpt,
          })
          await existing.save()
        } else {
          await ChangelogEntryTranslation.create({
            id: uuid(),
            changelogEntryId: entry.id,
            locale: t.locale,
            title: t.title,
            body: t.body ?? null,
            excerpt: t.excerpt ?? null,
          })
        }
      }
    }

    if (payload.linkedPostIds !== undefined) {
      await entry.related('linkedPosts').sync(payload.linkedPostIds)
    }

    await entry.load('translations')
    await entry.load('author')

    return response.ok({
      data: entry.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/changelog/:entryId
   * Deletes a changelog entry
   */
  async destroy({ organization, params, response }: HttpContext) {
    const entry = await ChangelogEntry.query()
      .where('id', params.entryId)
      .where('organization_id', organization.id)
      .first()

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    await entry.delete()

    return response.ok({ message: 'Changelog entry deleted successfully' })
  }

  /**
   * POST /api/v1/org/:orgSlug/changelog/:entryId/publish
   * Publishes a draft changelog entry
   */
  async publish({ organization, params, response }: HttpContext) {
    const entry = await ChangelogEntry.query()
      .where('id', params.entryId)
      .where('organization_id', organization.id)
      .first()

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    if (entry.status === 'published') {
      return response.badRequest({ message: 'Entry is already published' })
    }

    entry.status = 'published'
    entry.publishedAt = DateTime.now()
    await entry.save()

    await entry.load('translations')
    await entry.load('author')

    return response.ok({
      data: entry.serialize(),
      message: 'Changelog entry published successfully',
    })
  }

  /**
   * POST /api/v1/org/:orgSlug/changelog/subscribers
   * POST /api/v1/org/:orgSlug/public/changelog/subscribers
   * Subscribe to changelog updates
   */
  async subscribe({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(subscribeChangelogValidator)

    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const existing = await ChangelogSubscriber.query()
      .where('organization_id', org.id)
      .where('email', payload.email)
      .first()

    if (existing) {
      return response.ok({ message: 'Already subscribed' })
    }

    await ChangelogSubscriber.create({
      id: uuid(),
      organizationId: org.id,
      email: payload.email,
      isConfirmed: true,
      unsubscribeToken: uuid(),
    })

    return response.created({
      message: 'Subscribed to changelog updates',
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/changelog/subscribers/:email
   * DELETE /api/v1/org/:orgSlug/public/changelog/subscribers/:email
   * Unsubscribe from changelog updates
   */
  async unsubscribe({ params, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const subscriber = await ChangelogSubscriber.query()
      .where('organization_id', org.id)
      .where('email', params.email)
      .first()

    if (!subscriber) {
      return response.notFound({ message: 'Subscriber not found' })
    }

    await subscriber.delete()

    return response.ok({ message: 'Unsubscribed successfully' })
  }

  /**
   * GET /api/v1/org/:orgSlug/public/changelog
   * Public endpoint: lists published changelog entries
   */
  async publicIndex({ params, request, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const qs = request.qs()
    const page = Number(qs.page) || 1
    const limit = Math.min(Number(qs.limit) || 20, 100)

    const entries = await ChangelogEntry.query()
      .where('organization_id', org.id)
      .where('status', 'published')
      .preload('translations')
      .preload('author')
      .orderBy('published_at', 'desc')
      .paginate(page, limit)

    return response.ok(entries.serialize())
  }

  /**
   * GET /api/v1/org/:orgSlug/public/changelog/:entryId
   * Public endpoint: shows a single published changelog entry
   */
  async publicShow({ params, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const entry = await ChangelogEntry.query()
      .where('id', params.entryId)
      .where('organization_id', org.id)
      .where('status', 'published')
      .preload('translations')
      .preload('author')
      .first()

    if (!entry) {
      return response.notFound({ message: 'Changelog entry not found' })
    }

    return response.ok({
      data: entry.serialize(),
    })
  }
}
