import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type DigestService from '#services/digest_service'

const DIGEST_INTERVAL_MS = 10 * 60 * 1000

/**
 * Long-running process that triggers periodic jobs (digest emails).
 * Designed to run as a dedicated Docker service in production,
 * replacing the in-process setInterval from AppProvider.
 */
export default class Scheduler extends BaseCommand {
  static commandName = 'scheduler:run'
  static description = 'Start the background job scheduler (digest emails every 10 min)'
  static options: CommandOptions = { startApp: true }

  private digest!: DigestService

  async run() {
    const { default: Service } = await import('#services/digest_service')
    this.digest = new Service()

    this.logger.info('Scheduler started — digest every 10 min')

    await this.runDigest()
    setInterval(() => this.runDigest(), DIGEST_INTERVAL_MS)
  }

  private async runDigest() {
    try {
      await this.digest.run()
      this.logger.info('Digest run completed')
    } catch (error) {
      this.logger.error(`Digest failed: ${(error as Error).message}`)
    }
  }
}
