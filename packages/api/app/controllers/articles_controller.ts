import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import Article from '#models/article'
import ArticleTranslation from '#models/article_translation'
import ArticleFeedback from '#models/article_feedback'
import Organization from '#models/organization'
import {
  createArticleValidator,
  updateArticleValidator,
  articleFeedbackValidator,
  articleSearchValidator,
} from '#validators/article_validator'

export default class ArticlesController {
  /**
   * GET /api/v1/org/:orgSlug/articles
   * Lists articles for the organization, with optional filters
   */
  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()

    const query = Article.query()
      .where('organization_id', organization.id)
      .preload('translations')
      .preload('author')
      .preload('collection')

    if (qs.collectionId) {
      query.where('collection_id', qs.collectionId)
    }

    if (qs.status) {
      query.where('status', qs.status)
    }

    const page = Number(qs.page) || 1
    const limit = Math.min(Number(qs.limit) || 20, 100)

    const articles = await query.orderBy('sort_order', 'asc').paginate(page, limit)

    return response.ok(articles.serialize())
  }

  /**
   * POST /api/v1/org/:orgSlug/articles
   * Creates a new article
   */
  async store({ organization, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createArticleValidator)
    const user = auth.user!

    const existing = await Article.query()
      .where('organization_id', organization.id)
      .where('slug', payload.slug)
      .first()

    if (existing) {
      return response.conflict({ message: 'An article with this slug already exists' })
    }

    const article = await Article.create({
      id: uuid(),
      organizationId: organization.id,
      collectionId: payload.collectionId ?? null,
      authorId: user.id,
      slug: payload.slug,
      sortOrder: payload.sortOrder ?? 0,
      status: payload.status ?? 'draft',
      publishedAt: payload.status === 'published' ? DateTime.now() : null,
    })

    for (const t of payload.translations) {
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

    await article.load('translations')
    await article.load('author')

    return response.created({
      data: article.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/articles/:articleId
   * Shows a single article
   */
  async show({ organization, params, response }: HttpContext) {
    const article = await Article.query()
      .where('id', params.articleId)
      .where('organization_id', organization.id)
      .preload('translations')
      .preload('author')
      .preload('collection')
      .preload('feedbacks')
      .first()

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    return response.ok({
      data: article.serialize(),
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/articles/:articleId
   * Updates an article
   */
  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateArticleValidator)

    const article = await Article.query()
      .where('id', params.articleId)
      .where('organization_id', organization.id)
      .first()

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    if (payload.slug && payload.slug !== article.slug) {
      const existing = await Article.query()
        .where('organization_id', organization.id)
        .where('slug', payload.slug)
        .whereNot('id', article.id)
        .first()

      if (existing) {
        return response.conflict({ message: 'An article with this slug already exists' })
      }
    }

    const wasPublished = article.status === 'published'
    const willPublish = payload.status === 'published'

    article.merge({
      collectionId:
        payload.collectionId !== undefined ? payload.collectionId : article.collectionId,
      slug: payload.slug ?? article.slug,
      sortOrder: payload.sortOrder ?? article.sortOrder,
      status: payload.status ?? article.status,
      publishedAt:
        !wasPublished && willPublish ? DateTime.now() : article.publishedAt,
    })

    await article.save()

    if (payload.translations) {
      for (const t of payload.translations) {
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

    return response.ok({
      data: article.serialize(),
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/articles/:articleId
   * Deletes an article
   */
  async destroy({ organization, params, response }: HttpContext) {
    const article = await Article.query()
      .where('id', params.articleId)
      .where('organization_id', organization.id)
      .first()

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    await article.delete()

    return response.ok({ message: 'Article deleted successfully' })
  }

  /**
   * POST /api/v1/org/:orgSlug/articles/:articleId/feedback
   * Submits feedback on an article (public)
   */
  async feedback({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(articleFeedbackValidator)

    const article = await Article.query().where('id', params.articleId).first()

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    const feedback = await ArticleFeedback.create({
      id: uuid(),
      articleId: article.id,
      endUserId: payload.endUserId ?? null,
      reaction: payload.reaction,
      comment: payload.comment ?? null,
    })

    return response.created({
      data: feedback.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/articles/search
   * Searches articles by title/body text
   */
  async search({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(articleSearchValidator)

    const query = ArticleTranslation.query()
      .whereHas('article', (articleQuery) => {
        articleQuery.where('organization_id', organization.id).where('status', 'published')

        if (payload.collectionId) {
          articleQuery.where('collection_id', payload.collectionId)
        }
      })
      .where((builder) => {
        builder.whereILike('title', `%${payload.q}%`).orWhereILike('body', `%${payload.q}%`)
      })
      .preload('article')

    if (payload.locale) {
      query.where('locale', payload.locale)
    }

    const results = await query.limit(50)

    return response.ok({
      data: results.map((r) => r.serialize()),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/public/articles/:articleId
   * Public endpoint: shows a published article
   */
  async publicShow({ params, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const article = await Article.query()
      .where('id', params.articleId)
      .where('organization_id', org.id)
      .where('status', 'published')
      .preload('translations')
      .preload('author')
      .preload('collection')
      .first()

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    return response.ok({
      data: article.serialize(),
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/public/articles/search
   * Public search for published articles
   */
  async publicSearch({ params, request, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const payload = await request.validateUsing(articleSearchValidator)

    const results = await ArticleTranslation.query()
      .whereHas('article', (articleQuery) => {
        articleQuery.where('organization_id', org.id).where('status', 'published')

        if (payload.collectionId) {
          articleQuery.where('collection_id', payload.collectionId)
        }
      })
      .where((builder) => {
        builder.whereILike('title', `%${payload.q}%`).orWhereILike('body', `%${payload.q}%`)
      })
      .preload('article')
      .limit(50)

    if (payload.locale) {
      results.filter((r) => r.locale === payload.locale)
    }

    return response.ok({
      data: results.map((r) => r.serialize()),
    })
  }
}
