import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have been registered
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    // Seed super admin on first boot if env vars are set
    if (this.app.getEnvironment() === 'web') {
      await this.seedSuperAdmin()
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}

  /**
   * Seeds the super admin user if SUPER_ADMIN_EMAIL and
   * SUPER_ADMIN_PASSWORD env vars are set and no super admin exists.
   */
  private async seedSuperAdmin() {
    try {
      const env = await import('#start/env')
      const email = env.default.get('SUPER_ADMIN_EMAIL')
      const password = env.default.get('SUPER_ADMIN_PASSWORD')

      if (!email || !password) {
        return
      }

      const { default: AdminUser } = await import('#models/admin_user')
      const { v4: uuid } = await import('uuid')

      const existing = await AdminUser.query().where('is_super_admin', true).first()
      if (existing) {
        return
      }

      await AdminUser.create({
        id: uuid(),
        email,
        password,
        fullName: 'Super Admin',
        isSuperAdmin: true,
      })

      console.log(`Super admin seeded: ${email}`)
    } catch (error) {
      // Silently fail if DB is not ready yet
      console.warn('Could not seed super admin:', (error as Error).message)
    }
  }
}
