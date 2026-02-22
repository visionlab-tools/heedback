import type { HttpContext } from '@adonisjs/core/http'
import Organization from '#models/organization'
import GitCommit from '#models/git_commit'
import GitWebhookService from '#services/git_webhook_service'
import AiService from '#services/ai_service'
import { generateChangelogValidator } from '#validators/git_webhook_validator'

export default class GitWebhookController {
  private webhookService = new GitWebhookService()

  /** Public endpoint — receives GitHub/GitLab push webhooks */
  async receive({ params, request, response }: HttpContext) {
    const org = await Organization.find(params.orgId)
    if (!org) return response.notFound({ message: 'Organization not found' })

    const settings = (org.settings ?? {}) as Record<string, unknown>
    const secret = settings.gitWebhookSecret as string | undefined
    if (!secret) return response.badRequest({ message: 'Git webhook not configured' })

    // Detect provider from headers
    const provider = this.detectProvider(request)
    if (!provider) return response.badRequest({ message: 'Unsupported git provider' })

    // Verify signature
    if (!this.verifySignature(provider, request, secret)) {
      return response.unauthorized({ message: 'Invalid webhook signature' })
    }

    const body = request.body()
    const productionBranch = (settings.gitProductionBranch as string) || 'main'
    const push = GitWebhookService.parsePayload(provider, body)

    // Only collect commits from the production branch
    if (push.branch !== productionBranch) {
      return response.ok({ received: true, commitsStored: 0 })
    }

    const count = await this.webhookService.storeCommits(org.id, push)
    return response.ok({ received: true, commitsStored: count })
  }

  /** Authenticated — generate a changelog draft from pending commits */
  async generate({ organization, request, response }: HttpContext) {
    const { locales } = await request.validateUsing(generateChangelogValidator)

    const commits = await GitCommit.query()
      .where('organization_id', organization.id)
      .where('processed', false)
      .orderBy('committed_at', 'asc')

    if (!commits.length) {
      return response.unprocessableEntity({ message: 'No unprocessed commits' })
    }

    const targetLocales = locales?.length ? locales : ['en']

    try {
      const result = await AiService.generateChangelog(organization, commits, targetLocales)

      // Mark commits as processed only on success
      await GitCommit.query()
        .where('organization_id', organization.id)
        .where('processed', false)
        .update({ processed: true })

      return response.ok({
        data: { ...result, commitCount: commits.length },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI generation failed'
      return response.badGateway({ message })
    }
  }

  /** Authenticated — count of unprocessed commits */
  async pendingCount({ organization, response }: HttpContext) {
    const count = await GitCommit.query()
      .where('organization_id', organization.id)
      .where('processed', false)
      .count('* as total')

    return response.ok({ count: Number(count[0].$extras.total) })
  }

  private detectProvider(request: HttpContext['request']): 'github' | 'gitlab' | null {
    if (request.header('X-GitHub-Event')) return 'github'
    if (request.header('X-Gitlab-Event')) return 'gitlab'
    return null
  }

  private verifySignature(
    provider: 'github' | 'gitlab',
    request: HttpContext['request'],
    secret: string
  ): boolean {
    if (provider === 'github') {
      const signature = request.header('X-Hub-Signature-256') ?? ''
      return GitWebhookService.verifyGitHub(request.raw() ?? '', signature, secret)
    }

    const token = request.header('X-Gitlab-Token') ?? ''
    return GitWebhookService.verifyGitLab(token, secret)
  }
}
