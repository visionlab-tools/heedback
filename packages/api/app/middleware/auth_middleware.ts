import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware verifies that the user is authenticated
 * via session-based authentication before allowing the request
 * to proceed.
 */
export default class AuthMiddleware {
  redirectTo = '/api/v1/auth/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards || ['web'], {
      loginRoute: this.redirectTo,
    })

    return next()
  }
}
