import db from '@adonisjs/lucid/services/db'
import Article from '#models/article'
import EmbeddingService from '#services/embedding_service'

const MAX_ARTICLES = 10
const SEMANTIC_MAX_CHUNKS = 20
const CHAR_BUDGET = 30_000

interface RetrievedArticle {
  title: string
  body: string
}

export default class KnowledgeRetrievalService {
  /**
   * Retrieve relevant knowledge base articles for an AI conversation.
   * Fallback chain: semantic search → full-text search → most recent articles.
   */
  static async retrieve(
    orgId: string,
    userMessages: string[],
    locale: string,
    openaiKey?: string,
  ): Promise<string> {
    const query = KnowledgeRetrievalService.extractSearchQuery(userMessages)
    console.log('[KnowledgeRetrieval] orgId=%s locale=%s hasOpenAI=%s query="%s"',
      orgId, locale, !!openaiKey, query?.slice(0, 100))

    if (!query) {
      console.log('[KnowledgeRetrieval] Empty query, using recent articles fallback')
      return KnowledgeRetrievalService.recentArticlesFallback(orgId, locale)
    }

    // Try semantic search first (requires OpenAI key + pgvector)
    if (openaiKey) {
      const semantic = await KnowledgeRetrievalService.semanticSearch(
        orgId, query, locale, openaiKey,
      )
      console.log('[KnowledgeRetrieval] Semantic search returned %d articles', semantic.length)
      if (semantic.length) {
        return KnowledgeRetrievalService.formatArticles(semantic)
      }
    }

    // Full-text search fallback
    const fts = await KnowledgeRetrievalService.fullTextSearch(orgId, query, locale)
    console.log('[KnowledgeRetrieval] FTS returned %d articles', fts.length)
    if (fts.length) {
      return KnowledgeRetrievalService.formatArticles(fts)
    }

    console.log('[KnowledgeRetrieval] All searches empty, using recent articles fallback')
    return KnowledgeRetrievalService.recentArticlesFallback(orgId, locale)
  }

  /**
   * Extract search terms from the last few user messages.
   * Keeps only the 3 most recent to focus on the current topic.
   */
  private static extractSearchQuery(messages: string[]): string {
    return messages
      .slice(-3)
      .join(' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500)
  }

  /**
   * Semantic search using pgvector cosine similarity.
   * Embeds the query then finds nearest article chunks.
   */
  private static async semanticSearch(
    orgId: string,
    query: string,
    locale: string,
    openaiKey: string,
  ): Promise<RetrievedArticle[]> {
    try {
      const [queryEmbedding] = await EmbeddingService.embed(openaiKey, [query])
      const vectorStr = `[${queryEmbedding.join(',')}]`

      const rows = await db.rawQuery<{ rows: Array<{
        title: string
        body: string
        locale: string
        article_id: string
        distance: number
      }> }>(`
        SELECT
          at.title,
          at.body,
          at.locale,
          at.article_id,
          ae.embedding <=> ?::vector AS distance
        FROM article_embeddings ae
        INNER JOIN article_translations at ON at.id = ae.article_translation_id
        INNER JOIN articles a ON a.id = at.article_id
        WHERE ae.organization_id = ?
          AND a.status = 'published'
        ORDER BY
          ae.embedding <=> ?::vector ASC
        LIMIT ?
      `, [vectorStr, orgId, vectorStr, SEMANTIC_MAX_CHUNKS])

      // Deduplicate by article_id, preferring user locale
      const seen = new Set<string>()
      const results: RetrievedArticle[] = []

      // Sort: prefer matching locale, then by distance
      const sorted = rows.rows.sort((a, b) => {
        const aLocale = a.locale === locale ? 0 : a.locale === 'en' ? 1 : 2
        const bLocale = b.locale === locale ? 0 : b.locale === 'en' ? 1 : 2
        if (aLocale !== bLocale) return aLocale - bLocale
        return a.distance - b.distance
      })

      for (const row of sorted) {
        if (seen.has(row.article_id)) continue
        seen.add(row.article_id)
        if (row.body) {
          results.push({ title: row.title, body: row.body })
        }
        if (results.length >= MAX_ARTICLES) break
      }

      return results
    } catch (err) {
      // pgvector not available or API error — fall through to FTS
      console.warn('[KnowledgeRetrieval] Semantic search failed, falling back to FTS:', err)
      return []
    }
  }

  /**
   * Full-text search using PostgreSQL tsvector on article_translations.
   * Prefers user locale, falls back to 'en', then any locale.
   */
  private static async fullTextSearch(
    orgId: string,
    query: string,
    locale: string,
  ): Promise<RetrievedArticle[]> {
    const words = query.split(' ').filter((w) => w.length > 1)
    if (!words.length) return []

    // OR-combined prefix matching for broader recall
    const tsquery = words.map((w) => `${w}:*`).join(' | ')

    const rows = await db.rawQuery<{ rows: Array<{
      title: string
      body: string
      locale: string
      article_id: string
      rank: number
    }> }>(`
      SELECT
        at.title,
        at.body,
        at.locale,
        at.article_id,
        ts_rank_cd(at.search_vector, to_tsquery('simple', ?)) AS rank
      FROM article_translations at
      INNER JOIN articles a ON a.id = at.article_id
      WHERE a.organization_id = ?
        AND a.status = 'published'
        AND at.search_vector @@ to_tsquery('simple', ?)
      ORDER BY
        CASE at.locale WHEN ? THEN 0 WHEN 'en' THEN 1 ELSE 2 END,
        rank DESC
      LIMIT ?
    `, [tsquery, orgId, tsquery, locale, MAX_ARTICLES * 2])

    // Deduplicate by article_id, keeping the best locale match
    const seen = new Set<string>()
    const results: RetrievedArticle[] = []

    for (const row of rows.rows) {
      if (seen.has(row.article_id)) continue
      seen.add(row.article_id)
      if (row.body) {
        results.push({ title: row.title, body: row.body })
      }
      if (results.length >= MAX_ARTICLES) break
    }

    return results
  }

  /** Fallback: return the most recently published articles. */
  private static async recentArticlesFallback(
    orgId: string,
    locale: string,
  ): Promise<string> {
    const articles = await Article.query()
      .where('organization_id', orgId)
      .where('status', 'published')
      .preload('translations')
      .orderBy('published_at', 'desc')
      .limit(MAX_ARTICLES)

    console.log('[KnowledgeRetrieval] Fallback: %d published articles found', articles.length)

    const results: RetrievedArticle[] = []
    for (const article of articles) {
      const t =
        article.translations.find((tr) => tr.locale === locale)
        || article.translations.find((tr) => tr.locale === 'en')
        || article.translations[0]

      if (t?.body) {
        results.push({ title: t.title, body: t.body })
      } else {
        console.log('[KnowledgeRetrieval] Article %s has no body for locale=%s (translation locales: %s)',
          article.id, locale, article.translations.map((tr) => tr.locale).join(','))
      }
    }

    return KnowledgeRetrievalService.formatArticles(results)
  }

  /** Format articles as markdown, respecting the character budget. */
  private static formatArticles(articles: RetrievedArticle[]): string {
    let result = ''
    for (const a of articles) {
      const section = `## ${a.title}\n${a.body}\n\n`
      if (result.length + section.length > CHAR_BUDGET) break
      result += section
    }
    return result
  }
}
