import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth_validator'
import AuthService from '#services/auth_service'

export default class AuthController {
  private authService = new AuthService()

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await this.authService.login(email, password)
    await auth.use('web').login(user)

    return response.ok({
      message: 'Logged in successfully',
      user: user.serialize(),
    })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.ok({
      message: 'Logged out successfully',
    })
  }

  async me({ auth, response }: HttpContext) {
    const user = await this.authService.getProfile(auth.user!.id)

    return response.ok({
      user: user!.serialize(),
    })
  }
}
