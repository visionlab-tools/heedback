import redis from '@adonisjs/redis/services/main'
import db from '@adonisjs/lucid/services/db'
import ArticleTranslation from '#models/article_translation'
import Article from '#models/article'
import EmbeddingService from '#services/embedding_service'

const SYNC_LOCK_TTL = 120

export default class ArticleEmbeddingSyncService {
  /** Chunk, embed, and upsert embeddings for a single translation. */
  static async syncTranslation(
    translationId: string,
    orgId: string,
    openaiKey: string,
  ): Promise<void> {
    const lockKey = `embed-sync:${translationId}`
    const acquired = await redis.set(lockKey, '1', 'EX', SYNC_LOCK_TTL, 'NX')
    if (!acquired) return

    try {
      const translation = await ArticleTranslation.find(translationId)
      if (!translation?.body) return

      const chunks = EmbeddingService.chunkArticle(translation.title, translation.body)
      const embeddings = await EmbeddingService.embed(openaiKey, chunks)

      // Delete existing embeddings for this translation, then insert fresh
      await db.rawQuery(
        'DELETE FROM article_embeddings WHERE article_translation_id = ?',
        [translationId],
      )

      for (let i = 0; i < chunks.length; i++) {
        await db.rawQuery(
          `INSERT INTO article_embeddings
            (article_translation_id, organization_id, chunk_index, chunk_text, embedding)
          VALUES (?, ?, ?, ?, ?::vector)`,
          [translationId, orgId, i, chunks[i], `[${embeddings[i].join(',')}]`],
        )
      }
    } finally {
      await redis.del(lockKey)
    }
  }

  /** Remove all embeddings for an article (all translations). */
  static async deleteForArticle(articleId: string): Promise<void> {
    await db.rawQuery(
      `DELETE FROM article_embeddings
       WHERE article_translation_id IN (
         SELECT id FROM article_translations WHERE article_id = ?
       )`,
      [articleId],
    )
  }

  /** Sync all published articles for an organization. */
  static async bulkSync(orgId: string, openaiKey: string): Promise<number> {
    const articles = await Article.query()
      .where('organization_id', orgId)
      .where('status', 'published')
      .preload('translations')

    let synced = 0
    for (const article of articles) {
      for (const translation of article.translations) {
        if (!translation.body) continue
        await ArticleEmbeddingSyncService.syncTranslation(
          translation.id,
          orgId,
          openaiKey,
        )
        synced++
      }
    }

    return synced
  }
}
