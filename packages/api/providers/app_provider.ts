import type { ApplicationService } from '@adonisjs/core/types'

const DIGEST_INTERVAL_MS = 10 * 60 * 1000

export default class AppProvider {
  private digestTimer?: ReturnType<typeof setInterval>

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
    if (this.app.getEnvironment() === 'web') {
      await this.seedSuperAdmin()
      this.startDigestScheduler()
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    if (this.digestTimer) {
      clearInterval(this.digestTimer)
    }
  }

  /** Run email digests every 10 minutes (Redis-locked for multi-instance safety) */
  private startDigestScheduler() {
    this.digestTimer = setInterval(async () => {
      try {
        const { default: DigestService } = await import('#services/digest_service')
        const digest = new DigestService()
        await digest.run()
      } catch (error) {
        console.warn('[Digest] Scheduler error:', (error as Error).message)
      }
    }, DIGEST_INTERVAL_MS)
  }

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
