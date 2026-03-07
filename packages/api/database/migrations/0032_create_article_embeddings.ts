import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // Graceful: skip entirely if pgvector extension is not available
      try {
        await db.rawQuery('CREATE EXTENSION IF NOT EXISTS vector')
      } catch {
        console.warn('[Migration] pgvector extension not available, skipping article_embeddings')
        return
      }

      await db.rawQuery(`
        CREATE TABLE IF NOT EXISTS article_embeddings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          article_translation_id UUID NOT NULL
            REFERENCES article_translations(id) ON DELETE CASCADE,
          organization_id UUID NOT NULL,
          chunk_index INTEGER NOT NULL DEFAULT 0,
          chunk_text TEXT NOT NULL,
          embedding vector(1536) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now(),
          UNIQUE(article_translation_id, chunk_index)
        )
      `)

      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS article_embeddings_org_idx
        ON article_embeddings (organization_id)
      `)

      // HNSW works on empty tables unlike IVFFlat
      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS article_embeddings_vector_idx
        ON article_embeddings USING hnsw (embedding vector_cosine_ops)
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP TABLE IF EXISTS article_embeddings')
    })
  }
}
