import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class RunDigest extends BaseCommand {
  static commandName = 'digest:run'
  static description = 'Manually trigger the email digest for unread messages'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: DigestService } = await import('#services/digest_service')
    const digest = new DigestService()

    this.logger.info('Running digest…')

    try {
      await digest.run()
      this.logger.success('Digest completed')
    } catch (error) {
      this.logger.error(`Digest failed: ${(error as Error).message}`)
      this.exitCode = 1
    }
  }
}
