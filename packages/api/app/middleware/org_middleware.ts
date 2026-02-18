import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Organization from '#models/organization'
import { isUuid } from '#helpers/uuid'

/**
 * Org middleware resolves the organization from the :orgSlug route
 * parameter and attaches it to the HTTP context.
 * Accepts both UUID (id) and slug for flexibility — the widget uses
 * the org ID while legacy URLs may still use the slug.
 *
 * Usage: .use(middleware.org())
 */
export default class OrgMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const orgSlug = ctx.params.orgSlug

    if (!orgSlug) {
      return ctx.response.badRequest({
        message: 'Organization identifier is required',
      })
    }

    // Accept both UUID and slug — check format to avoid Postgres uuid cast errors
    const organization = isUuid(orgSlug)
      ? await Organization.findBy('id', orgSlug)
      : await Organization.findBy('slug', orgSlug)

    if (!organization) {
      return ctx.response.notFound({
        message: `Organization "${orgSlug}" not found`,
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
