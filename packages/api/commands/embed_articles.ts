import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class EmbedArticles extends BaseCommand {
  static commandName = 'embed:articles'
  static description = 'Generate embeddings for all published articles (requires OpenAI API key in org settings)'
  static options: CommandOptions = { startApp: true }

  @flags.string({ description: 'Sync a specific organization by ID' })
  declare org: string | undefined

  async run() {
    const { default: Organization } = await import('#models/organization')
    const { default: ArticleEmbeddingSyncService } = await import(
      '#services/article_embedding_sync_service'
    )

    const orgs = this.org
      ? await Organization.query().where('id', this.org)
      : await Organization.all()

    for (const organization of orgs) {
      const settings = (organization.settings ?? {}) as Record<string, unknown>
      const openaiKey = settings.openaiApiKey as string | undefined
      if (!openaiKey) {
        this.logger.warning(`[${organization.name}] No OpenAI API key, skipping`)
        continue
      }

      this.logger.info(`[${organization.name}] Syncing embeddings…`)
      const count = await ArticleEmbeddingSyncService.bulkSync(organization.id, openaiKey)
      this.logger.success(`[${organization.name}] Synced ${count} translations`)
    }
  }
}
