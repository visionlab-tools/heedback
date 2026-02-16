import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import OrgMember from '#models/org_member'

/**
 * OrgRole middleware checks that the authenticated user has one of
 * the required roles within the current organization.
 *
 * Must be used after both auth and org middleware.
 *
 * Usage: .use(middleware.orgRole({ roles: ['owner', 'admin'] }))
 */
export default class OrgRoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { roles: string[] }
  ) {
    const user = ctx.auth.user!
    const organization = ctx.organization

    if (!organization) {
      return ctx.response.internalServerError({
        message: 'Organization context is missing. Apply org middleware first.',
      })
    }

    // Super admins bypass role checks
    if (user.isSuperAdmin) {
      return next()
    }

    const membership = await OrgMember.query()
      .where('organization_id', organization.id)
      .where('admin_user_id', user.id)
      .first()

    if (!membership) {
      return ctx.response.forbidden({
        message: 'You are not a member of this organization',
      })
    }

    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(membership.role)) {
        return ctx.response.forbidden({
          message: `Insufficient role. Required: ${options.roles.join(' or ')}`,
        })
      }
    }

    // Attach membership to context for downstream use
    ctx.orgMembership = membership

    return next()
  }
}

/**
 * Extend HttpContext to include the org membership
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    orgMembership?: OrgMember
  }
}
