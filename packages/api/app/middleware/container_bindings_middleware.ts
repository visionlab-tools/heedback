import type { NextFn } from '@adonisjs/core/types/http'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Binds request-specific data to the container for use throughout
 * the request lifecycle.
 */
export default class ContainerBindingsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.containerResolver.bindValue('httpContext', ctx)
    return next()
  }
}
