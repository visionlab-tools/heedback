import type { ApplicationService } from '@adonisjs/core/types'
import type { ScheduledTask } from 'node-cron'

export default class AppProvider {
  private digestTask?: ScheduledTask

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
      await this.startDigestCron()
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    this.digestTask?.stop()
  }

  /**
   * Schedules digest emails every 10 minutes via node-cron.
   * Uses a Redis distributed lock inside DigestService to
   * prevent duplicate runs in multi-instance deployments.
   */
  private async startDigestCron() {
    const cron = await import('node-cron')
    const { default: DigestService } = await import('#services/digest_service')
    const digest = new DigestService()

    this.digestTask = cron.schedule('*/10 * * * *', async () => {
      try {
        await digest.run()
      } catch (error) {
        console.error('Digest run failed:', (error as Error).message)
      }
    })

    console.log('Digest cron scheduled (every 10 min)')
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
