import type { HttpContext } from '@adonisjs/core/http'
import AdminUser from '#models/admin_user'
import { loginValidator } from '#validators/auth_validator'
import { DateTime } from 'luxon'

export default class AuthController {
  /**
   * POST /api/v1/auth/login
   * Authenticates an admin user via session
   */
  async login({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await AdminUser.verifyCredentials(email, password)

    await auth.use('web').login(user)

    user.lastLoginAt = DateTime.now()
    await user.save()

    return response.ok({
      message: 'Logged in successfully',
      user: user.serialize(),
    })
  }

  /**
   * POST /api/v1/auth/logout
   * Logs out the current session
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.ok({
      message: 'Logged out successfully',
    })
  }

  /**
   * GET /api/v1/auth/me
   * Returns the currently authenticated user
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user!

    await user.load('orgMemberships', (query) => {
      query.preload('organization')
    })

    return response.ok({
      user: user.serialize(),
    })
  }
}
