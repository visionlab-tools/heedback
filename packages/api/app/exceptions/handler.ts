import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML page for certain error
   * codes. Since this is an API, we override with JSON responses instead.
   */
  protected statusPages = {}

  /**
   * The method is used for handling errors and returning a JSON response.
   */
  async handle(error: unknown, ctx: HttpContext) {
    const err = error as {
      status?: number
      code?: string
      message?: string
      messages?: unknown
    }

    // Validation errors from VineJS
    if (err.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(422).json({
        message: 'Validation failed',
        errors: err.messages,
      })
    }

    // Auth errors
    if (err.code === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.status(401).json({
        message: 'Authentication required',
      })
    }

    // Invalid credentials
    if (err.code === 'E_INVALID_CREDENTIALS') {
      return ctx.response.status(400).json({
        message: 'Invalid email or password',
      })
    }

    // Row not found
    if (err.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.status(404).json({
        message: 'Resource not found',
      })
    }

    // Route not found
    if (err.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).json({
        message: 'Route not found',
      })
    }

    // Default: delegate to the parent handler
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to logging services or
   * send a notification.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
