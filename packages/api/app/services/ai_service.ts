import type Organization from '#models/organization'
import type GitCommit from '#models/git_commit'

interface GeneratedTranslation {
  locale: string
  title: string
  body: string
  excerpt: string
}

export interface GeneratedChangelog {
  slug: string
  labels: string[]
  translations: GeneratedTranslation[]
}

const MAX_COMMITS = 50

const SYSTEM_PROMPT = `You are a product changelog writer. Given a list of git commits, produce a user-facing changelog entry.

Rules:
- Write for end-users, not developers. Avoid jargon like "refactor", "merge", "rebase".
- Group changes under labels: "new" (new features), "improvement" (enhancements), "fix" (bug fixes), "breaking" (breaking changes). Only include labels that apply.
- Generate a URL-safe slug (lowercase, hyphens, no special chars) summarizing the release.
- Write a Markdown body with sections grouped by label (## New, ## Improvements, ## Fixes, ## Breaking Changes). Use bullet points.
- Write an excerpt (1-2 sentences, max 200 chars) summarizing the most important changes.
- If multiple locales are requested, produce a natural translation for each (not machine-translated gibberish).
- Return ONLY valid JSON matching this exact shape (no markdown fences, no extra text):
{
  "slug": "string",
  "labels": ["string"],
  "translations": [{ "locale": "string", "title": "string", "body": "string", "excerpt": "string" }]
}`

export default class AiService {
  /** Generate a changelog draft from unprocessed commits */
  static async generateChangelog(
    org: Organization,
    commits: GitCommit[],
    locales: string[]
  ): Promise<GeneratedChangelog> {
    const settings = (org.settings ?? {}) as Record<string, unknown>
    const anthropicKey = settings.anthropicApiKey as string | undefined
    const openaiKey = settings.openaiApiKey as string | undefined

    if (!anthropicKey && !openaiKey) {
      throw new Error('No AI API key configured. Add an Anthropic or OpenAI key in Settings > Integrations.')
    }

    // Cap commits to avoid token overflow
    const capped = commits.slice(-MAX_COMMITS)
    const note = commits.length > MAX_COMMITS
      ? `\n\nNote: Showing the ${MAX_COMMITS} most recent commits out of ${commits.length} total.\n`
      : ''

    const commitList = capped.map((c) => {
      let entry = `- ${c.sha.slice(0, 7)} ${c.message}`
      if (c.diffSummary) entry += `\n  Files: ${c.diffSummary}`
      return entry
    }).join('\n')

    const userPrompt = `Generate a changelog entry from these commits:${note}\n\n${commitList}\n\nLocales to generate: ${locales.join(', ')}`

    const raw = anthropicKey
      ? await AiService.callAnthropic(anthropicKey, userPrompt)
      : await AiService.callOpenAI(openaiKey!, userPrompt)

    return AiService.parseResponse(raw)
  }

  private static async callAnthropic(apiKey: string, userPrompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${text.slice(0, 500)}`)
    }

    const data = await res.json()
    return data.content?.[0]?.text ?? ''
  }

  private static async callOpenAI(apiKey: string, userPrompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OpenAI API error (${res.status}): ${text.slice(0, 500)}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  private static parseResponse(raw: string): GeneratedChangelog {
    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.error('[AiService] Failed to parse JSON response:', raw.slice(0, 1000))
      throw new Error('AI returned invalid JSON. Please try again.')
    }

    if (!parsed.slug || !Array.isArray(parsed.translations) || !parsed.translations.length) {
      console.error('[AiService] Malformed response:', JSON.stringify(parsed).slice(0, 1000))
      throw new Error('AI response is missing required fields (slug, translations).')
    }

    return {
      slug: String(parsed.slug),
      labels: Array.isArray(parsed.labels) ? parsed.labels.map(String) : [],
      translations: parsed.translations.map((t: any) => ({
        locale: String(t.locale ?? 'en'),
        title: String(t.title ?? ''),
        body: String(t.body ?? ''),
        excerpt: String(t.excerpt ?? ''),
      })),
    }
  }
}
