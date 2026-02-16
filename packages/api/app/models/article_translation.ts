import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Article from '#models/article'

export default class ArticleTranslation extends BaseModel {
  static table = 'article_translations'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'article_id', serializeAs: 'articleId' })
  declare articleId: string

  @column({ columnName: 'locale', serializeAs: 'locale' })
  declare locale: string

  @column({ columnName: 'title', serializeAs: 'title' })
  declare title: string

  @column({ columnName: 'body', serializeAs: 'body' })
  declare body: string | null

  @column({ columnName: 'meta_title', serializeAs: 'metaTitle' })
  declare metaTitle: string | null

  @column({ columnName: 'meta_description', serializeAs: 'metaDescription' })
  declare metaDescription: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relationships
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Article, { foreignKey: 'articleId' })
  declare article: BelongsTo<typeof Article>
}
