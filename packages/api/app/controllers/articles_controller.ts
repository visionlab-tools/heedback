import type { HttpContext } from '@adonisjs/core/http'
import Organization from '#models/organization'
import { isUuid } from '#helpers/uuid'
import {
  createArticleValidator,
  updateArticleValidator,
  articleFeedbackValidator,
  articleSearchValidator,
} from '#validators/article_validator'
import ArticleService from '#services/article_service'

export default class ArticlesController {
  private articleService = new ArticleService()

  async index({ organization, request, response }: HttpContext) {
    const qs = request.qs()

    const articles = await this.articleService.list(organization.id, {
      collectionId: qs.collectionId,
      status: qs.status,
      page: Number(qs.page) || 1,
      limit: Number(qs.limit) || 20,
    })

    return response.ok(articles.serialize())
  }

  async store({ organization, auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createArticleValidator)

    try {
      const article = await this.articleService.create(organization.id, auth.user!.id, payload)
      return response.created({ data: article.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async show({ organization, params, response }: HttpContext) {
    const article = await this.articleService.show(organization.id, params.articleId)

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    return response.ok({ data: article.serialize() })
  }

  async update({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateArticleValidator)

    try {
      const article = await this.articleService.update(organization.id, params.articleId, payload)

      if (!article) {
        return response.notFound({ message: 'Article not found' })
      }

      return response.ok({ data: article.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async destroy({ organization, params, response }: HttpContext) {
    const article = await this.articleService.delete(organization.id, params.articleId)

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    return response.ok({ message: 'Article deleted successfully' })
  }

  async feedback({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(articleFeedbackValidator)

    const feedback = await this.articleService.addFeedback(params.articleId, payload)

    return response.created({ data: feedback.serialize() })
  }

  async search({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(articleSearchValidator)

    const results = await this.articleService.search(organization.id, payload)

    return response.ok({
      data: results.map((r) => r.serialize()),
    })
  }

  async publicShow({ params, request, response }: HttpContext) {
    const org = isUuid(params.orgId)
      ? await Organization.findBy('id', params.orgId)
      : await Organization.findBy('slug', params.orgId)

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const locale = request.qs().locale as string | undefined
    const article = await this.articleService.showPublished(org.id, params.articleId)

    if (!article) {
      return response.notFound({ message: 'Article not found' })
    }

    return response.ok({ data: this.serializePublicArticle(article, locale) })
  }

  async publicSearch({ params, request, response }: HttpContext) {
    const org = isUuid(params.orgId)
      ? await Organization.findBy('id', params.orgId)
      : await Organization.findBy('slug', params.orgId)

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const payload = await request.validateUsing(articleSearchValidator)
    const locale = request.qs().locale as string | undefined

    const results = await this.articleService.searchPublished(org.id, payload)

    return response.ok({
      data: results.map((r) => this.serializePublicArticle(r, locale)),
    })
  }

  /** Flatten translations so the widget gets { id, title, body, slug } */
  private serializePublicArticle(article: any, locale?: string) {
    const translations = article.translations ?? article.$preloaded?.translations ?? []
    const t = locale
      ? translations.find((tr: any) => tr.locale === locale) ?? translations[0]
      : translations[0]
    return {
      id: article.id,
      slug: article.slug,
      title: t?.title ?? '',
      body: t?.body ?? '',
    }
  }
}
