import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import Article from '#models/article'
import ArticleTranslation from '#models/article_translation'
import ArticleFeedback from '#models/article_feedback'

interface ArticleFilters {
  collectionId?: string
  status?: string
  tagId?: string
  page?: number
  limit?: number
}

interface ArticleSearchParams {
  q: string
  collectionId?: string
  locale?: string
}

export default class ArticleService {
  /**
   * List articles with optional filters and pagination.
   */
  async list(orgId: string, filters: ArticleFilters) {
    const query = Article.query()
      .where('organization_id', orgId)
      .preload('translations')
      .preload('author')
      .preload('tags')

    if (filters.collectionId) {
      query.where('collection_id', filters.collectionId)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.tagId) {
      const tagId = filters.tagId
      query.whereHas('tags', (q) => q.where('tags.id', tagId))
    }

    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)

    return query.orderBy('sort_order', 'asc').paginate(page, limit)
  }

  /**
   * Create a new article with translations.
   * Throws if the slug already exists within the organization.
   */
  async create(
    orgId: string,
    authorId: string,
    data: {
      slug: string
      collectionId?: string | null
      sortOrder?: number
      status?: 'draft' | 'published' | 'archived'
      tagIds?: string[]
      translations: Array<{
        locale: string
        title: string
        body?: string | null
        metaTitle?: string | null
        metaDescription?: string | null
      }>
    },
  ): Promise<Article> {
    const existing = await Article.query()
      .where('organization_id', orgId)
      .where('slug', data.slug)
      .first()

    if (existing) {
      throw new Error('An article with this slug already exists')
    }

    const article = await Article.create({
      id: uuid(),
      organizationId: orgId,
      collectionId: data.collectionId ?? null,
      authorId,
      slug: data.slug,
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? 'draft',
      publishedAt: data.status === 'published' ? DateTime.now() : null,
    })

    for (const t of data.translations) {
      await ArticleTranslation.create({
        id: uuid(),
        articleId: article.id,
        locale: t.locale,
        title: t.title,
        body: t.body ?? null,
        metaTitle: t.metaTitle ?? null,
        metaDescription: t.metaDescription ?? null,
      })
    }

    if (data.tagIds?.length) {
      await article.related('tags').sync(data.tagIds)
    }

    await article.load('translations')
    await article.load('author')
    await article.load('tags')

    return article
  }

  /**
   * Show a single article with all relations.
   * Returns null if not found.
   */
  async show(orgId: string, articleId: string): Promise<Article | null> {
    return Article.query()
      .where('id', articleId)
      .where('organization_id', orgId)
      .preload('translations')
      .preload('author')
      .preload('tags')
      .preload('feedbacks')
      .first()
  }

  /**
   * Update an article and upsert translations.
   * Returns null if the article is not found.
   * Throws if the new slug conflicts with another article in the org.
   */
  async update(
    orgId: string,
    articleId: string,
    data: {
      slug?: string
      collectionId?: string | null
      sortOrder?: number
      status?: 'draft' | 'published' | 'archived'
      tagIds?: string[]
      translations?: Array<{
        locale: string
        title: string
        body?: string | null
        metaTitle?: string | null
        metaDescription?: string | null
      }>
    },
  ): Promise<Article | null> {
    const article = await Article.query()
      .where('id', articleId)
      .where('organization_id', orgId)
      .first()

    if (!article) {
      return null
    }

    if (data.slug && data.slug !== article.slug) {
      const existing = await Article.query()
        .where('organization_id', orgId)
        .where('slug', data.slug)
        .whereNot('id', article.id)
        .first()

      if (existing) {
        throw new Error('An article with this slug already exists')
      }
    }

    const wasPublished = article.status === 'published'
    const willPublish = data.status === 'published'

    article.merge({
      collectionId: data.collectionId !== undefined ? data.collectionId : article.collectionId,
      slug: data.slug ?? article.slug,
      sortOrder: data.sortOrder ?? article.sortOrder,
      status: data.status ?? article.status,
      publishedAt: !wasPublished && willPublish ? DateTime.now() : article.publishedAt,
    })

    await article.save()

    if (data.tagIds) {
      await article.related('tags').sync(data.tagIds)
    }

    if (data.translations) {
      for (const t of data.translations) {
        const existing = await ArticleTranslation.query()
          .where('article_id', article.id)
          .where('locale', t.locale)
          .first()

        if (existing) {
          existing.merge({
            title: t.title,
            body: t.body !== undefined ? t.body : existing.body,
            metaTitle: t.metaTitle !== undefined ? t.metaTitle : existing.metaTitle,
            metaDescription:
              t.metaDescription !== undefined ? t.metaDescription : existing.metaDescription,
          })
          await existing.save()
        } else {
          await ArticleTranslation.create({
            id: uuid(),
            articleId: article.id,
            locale: t.locale,
            title: t.title,
            body: t.body ?? null,
            metaTitle: t.metaTitle ?? null,
            metaDescription: t.metaDescription ?? null,
          })
        }
      }
    }

    await article.load('translations')
    await article.load('author')
    await article.load('tags')

    return article
  }

  /**
   * Delete an article.
   * Returns null if the article is not found.
   */
  async delete(orgId: string, articleId: string): Promise<Article | null> {
    const article = await Article.query()
      .where('id', articleId)
      .where('organization_id', orgId)
      .first()

    if (!article) {
      return null
    }

    await article.delete()

    return article
  }

  /**
   * Add feedback to an article.
   */
  async addFeedback(
    articleId: string,
    data: {
      endUserId?: string | null
      reaction: 'helpful' | 'not_helpful'
      comment?: string | null
    },
  ): Promise<ArticleFeedback> {
    return ArticleFeedback.create({
      id: uuid(),
      articleId,
      endUserId: data.endUserId ?? null,
      reaction: data.reaction,
      comment: data.comment ?? null,
    })
  }

  /**
   * Search articles by title/body text using ILike on translations.
   */
  async search(orgId: string, params: ArticleSearchParams) {
    const query = ArticleTranslation.query()
      .whereHas('article', (articleQuery) => {
        articleQuery.where('organization_id', orgId)

        if (params.collectionId) {
          articleQuery.where('collection_id', params.collectionId)
        }
      })
      .where((builder) => {
        builder.whereILike('title', `%${params.q}%`).orWhereILike('body', `%${params.q}%`)
      })
      .preload('article')

    if (params.locale) {
      query.where('locale', params.locale)
    }

    return query.limit(50)
  }

  /**
   * Show a published article by id (public endpoint).
   * Returns null if the article is not found or not published.
   */
  async showPublished(orgId: string, articleId: string): Promise<Article | null> {
    return Article.query()
      .where('id', articleId)
      .where('organization_id', orgId)
      .where('status', 'published')
      .preload('translations')
      .preload('author')
      .preload('tags')
      .first()
  }

  /**
   * List all published articles for a public endpoint (flat list with tags).
   */
  async listPublished(orgId: string, params: { locale?: string; tagId?: string }) {
    const query = Article.query()
      .where('organization_id', orgId)
      .where('status', 'published')
      .preload('translations')
      .preload('tags')
      .orderBy('sort_order', 'asc')

    if (params.tagId) {
      query.whereHas('tags', (q) => q.where('tags.id', params.tagId!))
    }

    return query.limit(100)
  }

  /**
   * Search published articles by title/body text (public endpoint).
   */
  async searchPublished(orgId: string, params: ArticleSearchParams) {
    const query = ArticleTranslation.query()
      .whereHas('article', (articleQuery) => {
        articleQuery.where('organization_id', orgId).where('status', 'published')

        if (params.collectionId) {
          articleQuery.where('collection_id', params.collectionId)
        }
      })
      .where((builder) => {
        builder.whereILike('title', `%${params.q}%`).orWhereILike('body', `%${params.q}%`)
      })
      .preload('article')

    if (params.locale) {
      query.where('locale', params.locale)
    }

    return query.limit(50)
  }
}
