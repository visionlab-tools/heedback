import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Organization from '#models/organization'
import { isUuid } from '#helpers/uuid'

/**
 * Org middleware resolves the organization from the :orgId route
 * parameter and attaches it to the HTTP context.
 * Accepts both UUID (id) and slug for backwards compatibility —
 * the widget uses the org ID while the portal may still use the slug.
 *
 * Usage: .use(middleware.org())
 */
export default class OrgMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const orgIdentifier = ctx.params.orgId

    if (!orgIdentifier) {
      return ctx.response.badRequest({
        message: 'Organization identifier is required',
      })
    }

    // Accept both UUID and slug — check format to avoid Postgres uuid cast errors
    const organization = isUuid(orgIdentifier)
      ? await Organization.findBy('id', orgIdentifier)
      : await Organization.findBy('slug', orgIdentifier)

    if (!organization) {
      return ctx.response.notFound({
        message: `Organization "${orgIdentifier}" not found`,
      })
    }

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
