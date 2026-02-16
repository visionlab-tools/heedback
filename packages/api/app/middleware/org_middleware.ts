import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Organization from '#models/organization'

/**
 * Org middleware resolves the organization from the :orgSlug route
 * parameter and attaches it to the HTTP context.
 *
 * Usage: .use(middleware.org())
 */
export default class OrgMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const orgSlug = ctx.params.orgSlug

    if (!orgSlug) {
      return ctx.response.badRequest({
        message: 'Organization slug is required',
      })
    }

    const organization = await Organization.query().where('slug', orgSlug).first()

    if (!organization) {
      return ctx.response.notFound({
        message: `Organization "${orgSlug}" not found`,
      })
    }

    // Attach the organization to the context for downstream use
    ctx.organization = organization

    return next()
  }
}

/**
 * Extend HttpContext to include the organization
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    organization: Organization
  }
}
