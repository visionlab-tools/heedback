import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import ChangelogEntry from '#models/changelog_entry'
import ChangelogEntryTranslation from '#models/changelog_entry_translation'
import ChangelogSubscriber from '#models/changelog_subscriber'
import Organization from '#models/organization'

interface TranslationData {
  locale: string
  title: string
  body?: string | null
  excerpt?: string | null
}

interface CreateData {
  slug: string
  coverImageUrl?: string | null
  status?: 'draft' | 'published' | 'scheduled'
  labels?: string[] | null
  scheduledAt?: string | null
  translations: TranslationData[]
  linkedPostIds?: string[]
}

interface UpdateData {
  slug?: string
  coverImageUrl?: string | null
  status?: 'draft' | 'published' | 'scheduled'
  labels?: string[] | null
  scheduledAt?: string | null
  translations?: TranslationData[]
  linkedPostIds?: string[]
}

interface ListFilters {
  page?: number
  limit?: number
  status?: string
}

export default class ChangelogService {
  async list(orgId: string, filters: ListFilters) {
    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)

    const query = ChangelogEntry.query()
      .where('organization_id', orgId)
      .preload('translations')
      .preload('author')
      .preload('linkedPosts')

    if (filters.status) {
      query.where('status', filters.status)
    }

    const entries = await query.orderBy('created_at', 'desc').paginate(page, limit)

    return entries
  }

  async create(orgId: string, authorId: string, data: CreateData) {
    const existing = await ChangelogEntry.query()
      .where('organization_id', orgId)
      .where('slug', data.slug)
      .first()

    if (existing) {
      throw new Error('A changelog entry with this slug already exists')
    }

    const entry = await ChangelogEntry.create({
      id: uuid(),
      organizationId: orgId,
      authorId,
      slug: data.slug,
      coverImageUrl: data.coverImageUrl ?? null,
      status: data.status ?? 'draft',
      labels: data.labels ?? null,
      scheduledAt: data.scheduledAt ? DateTime.fromISO(data.scheduledAt) : null,
      publishedAt: data.status === 'published' ? DateTime.now() : null,
    })

    for (const t of data.translations) {
      await ChangelogEntryTranslation.create({
        id: uuid(),
        changelogEntryId: entry.id,
        locale: t.locale,
        title: t.title,
        body: t.body ?? null,
        excerpt: t.excerpt ?? null,
      })
    }

    if (data.linkedPostIds && data.linkedPostIds.length > 0) {
      await entry.related('linkedPosts').attach(data.linkedPostIds)
    }

    await entry.load('translations')
    await entry.load('author')

    return entry
  }

  async show(orgId: string, entryId: string) {
    const entry = await ChangelogEntry.query()
      .where('id', entryId)
      .where('organization_id', orgId)
      .preload('translations')
      .preload('author')
      .preload('linkedPosts')
      .first()

    if (!entry) return null

    return entry
  }

  async update(orgId: string, entryId: string, data: UpdateData) {
    const entry = await ChangelogEntry.query()
      .where('id', entryId)
      .where('organization_id', orgId)
      .first()

    if (!entry) return null

    if (data.slug && data.slug !== entry.slug) {
      const existing = await ChangelogEntry.query()
        .where('organization_id', orgId)
        .where('slug', data.slug)
        .whereNot('id', entry.id)
        .first()

      if (existing) {
        throw new Error('A changelog entry with this slug already exists')
      }
    }

    const wasPublished = entry.status === 'published'
    const willPublish = data.status === 'published'

    entry.merge({
      slug: data.slug ?? entry.slug,
      coverImageUrl:
        data.coverImageUrl !== undefined ? data.coverImageUrl : entry.coverImageUrl,
      status: data.status ?? entry.status,
      labels: data.labels !== undefined ? data.labels : entry.labels,
      scheduledAt:
        data.scheduledAt !== undefined
          ? data.scheduledAt
            ? DateTime.fromISO(data.scheduledAt)
            : null
          : entry.scheduledAt,
      publishedAt: !wasPublished && willPublish ? DateTime.now() : entry.publishedAt,
    })

    await entry.save()

    if (data.translations) {
      for (const t of data.translations) {
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

    if (data.linkedPostIds !== undefined) {
      await entry.related('linkedPosts').sync(data.linkedPostIds)
    }

    await entry.load('translations')
    await entry.load('author')

    return entry
  }

  async delete(orgId: string, entryId: string) {
    const entry = await ChangelogEntry.query()
      .where('id', entryId)
      .where('organization_id', orgId)
      .first()

    if (!entry) return null

    await entry.delete()

    return true
  }

  async publish(orgId: string, entryId: string) {
    const entry = await ChangelogEntry.query()
      .where('id', entryId)
      .where('organization_id', orgId)
      .first()

    if (!entry) return null

    if (entry.status === 'published') {
      throw new Error('Entry is already published')
    }

    entry.status = 'published'
    entry.publishedAt = DateTime.now()
    await entry.save()

    await entry.load('translations')
    await entry.load('author')

    return entry
  }

  async subscribe(orgSlug: string, email: string) {
    const org = await Organization.query().where('slug', orgSlug).first()

    if (!org) return null

    const existing = await ChangelogSubscriber.query()
      .where('organization_id', org.id)
      .where('email', email)
      .first()

    if (existing) {
      return { alreadySubscribed: true }
    }

    await ChangelogSubscriber.create({
      id: uuid(),
      organizationId: org.id,
      email,
      isConfirmed: true,
      unsubscribeToken: uuid(),
    })

    return { alreadySubscribed: false }
  }

  async unsubscribe(orgSlug: string, email: string) {
    const org = await Organization.query().where('slug', orgSlug).first()

    if (!org) return null

    const subscriber = await ChangelogSubscriber.query()
      .where('organization_id', org.id)
      .where('email', email)
      .first()

    if (!subscriber) {
      throw new Error('Subscriber not found')
    }

    await subscriber.delete()

    return true
  }

  async listPublished(orgSlug: string, page: number = 1, limit: number = 20) {
    const org = await Organization.query().where('slug', orgSlug).first()

    if (!org) return null

    const entries = await ChangelogEntry.query()
      .where('organization_id', org.id)
      .where('status', 'published')
      .preload('translations')
      .preload('author')
      .orderBy('published_at', 'desc')
      .paginate(page, Math.min(limit, 100))

    return entries
  }

  async showPublished(orgSlug: string, entryId: string) {
    const org = await Organization.query().where('slug', orgSlug).first()

    if (!org) return null

    const entry = await ChangelogEntry.query()
      .where('id', entryId)
      .where('organization_id', org.id)
      .where('status', 'published')
      .preload('translations')
      .preload('author')
      .first()

    if (!entry) return null

    return entry
  }
}
