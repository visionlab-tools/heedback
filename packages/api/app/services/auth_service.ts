import { DateTime } from 'luxon'
import AdminUser from '#models/admin_user'

export default class AuthService {
  /**
   * Verify credentials, update lastLoginAt, and return the user.
   */
  async login(email: string, password: string): Promise<AdminUser> {
    const user = await AdminUser.verifyCredentials(email, password)

    user.lastLoginAt = DateTime.now()
    await user.save()

    return user
  }

  /**
   * Load user with orgMemberships.organization and return it.
   * Returns null if the user is not found.
   */
  async getProfile(userId: string): Promise<AdminUser | null> {
    const user = await AdminUser.find(userId)

    if (!user) {
      return null
    }

    await user.load('orgMemberships', (query) => {
      query.preload('organization')
    })

    return user
  }
}
