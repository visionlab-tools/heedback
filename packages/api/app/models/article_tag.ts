import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ArticleTag extends BaseModel {
  static table = 'article_tags'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'article_id', serializeAs: 'articleId' })
  declare articleId: string

  @column({ columnName: 'tag_id', serializeAs: 'tagId' })
  declare tagId: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime
}
