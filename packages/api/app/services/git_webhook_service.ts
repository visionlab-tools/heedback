import crypto from 'node:crypto'
import GitCommit from '#models/git_commit'

interface NormalizedCommit {
  sha: string
  message: string
  authorName: string
  authorEmail: string
  committedAt: string
  diffSummary: string | null
}

interface NormalizedPush {
  branch: string
  commits: NormalizedCommit[]
}

export default class GitWebhookService {
  /** HMAC-SHA256 verification for GitHub webhooks */
  static verifyGitHub(rawBody: string, signature: string, secret: string): boolean {
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
    if (signature.length !== expected.length) return false
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  }

  /** Token comparison for GitLab webhooks */
  static verifyGitLab(token: string, secret: string): boolean {
    if (token.length !== secret.length) return false
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret))
  }

  /** Normalize GitHub/GitLab push payloads into a common shape */
  /** Both GitHub and GitLab share the same push payload shape for what we need */
  static parsePayload(_provider: 'github' | 'gitlab', body: Record<string, any>): NormalizedPush {
    const ref: string = body.ref ?? ''
    const branch = ref.replace('refs/heads/', '')

    const rawCommits: any[] = body.commits ?? []
    const commits: NormalizedCommit[] = rawCommits.map((c) => ({
      sha: String(c.id),
      message: String(c.message ?? '').slice(0, 5000),
      authorName: String(c.author?.name ?? 'Unknown'),
      authorEmail: String(c.author?.email ?? ''),
      committedAt: String(c.timestamp ?? new Date().toISOString()),
      diffSummary: GitWebhookService.buildDiffSummary(c),
    }))

    return { branch, commits }
  }

  /** Build a human-readable file list from push payload commit data */
  private static buildDiffSummary(commit: Record<string, any>): string | null {
    const parts: string[] = []
    const added: string[] = commit.added ?? []
    const removed: string[] = commit.removed ?? []
    const modified: string[] = commit.modified ?? []

    if (modified.length) parts.push(`Modified: ${modified.join(', ')}`)
    if (added.length) parts.push(`Added: ${added.join(', ')}`)
    if (removed.length) parts.push(`Removed: ${removed.join(', ')}`)

    if (!parts.length) return null
    return parts.join(' | ').slice(0, 2000)
  }

  /** Idempotently store commits — returns count of newly inserted rows */
  async storeCommits(orgId: string, push: NormalizedPush): Promise<number> {
    let inserted = 0

    for (const c of push.commits) {
      const existing = await GitCommit.query()
        .where('organization_id', orgId)
        .where('sha', c.sha)
        .first()

      if (!existing) {
        await GitCommit.create({
          organizationId: orgId,
          sha: c.sha,
          message: c.message,
          diffSummary: c.diffSummary,
          authorName: c.authorName,
          authorEmail: c.authorEmail,
          committedAt: new Date(c.committedAt) as any,
          branch: push.branch,
          processed: false,
        })
        inserted++
      }
    }

    return inserted
  }
}
