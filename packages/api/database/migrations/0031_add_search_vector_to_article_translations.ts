import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'article_translations'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, ''))
        ) STORED
      `)

      await db.rawQuery(`
        CREATE INDEX article_translations_search_vector_idx
        ON ${this.tableName} USING GIN (search_vector)
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS article_translations_search_vector_idx')
      await db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS search_vector`)
    })
  }
}
