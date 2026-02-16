import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Article from '#models/article'
import EndUser from '#models/end_user'

export default class ArticleFeedback extends BaseModel {
  static table = 'article_feedbacks'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'article_id', serializeAs: 'articleId' })
  declare articleId: string

  @column({ columnName: 'end_user_id', serializeAs: 'endUserId' })
  declare endUserId: string | null

  @column({ columnName: 'reaction', serializeAs: 'reaction' })
  declare reaction: 'helpful' | 'not_helpful'

  @column({ columnName: 'comment', serializeAs: 'comment' })
  declare comment: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relationships
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Article, { foreignKey: 'articleId' })
  declare article: BelongsTo<typeof Article>

  @belongsTo(() => EndUser, { foreignKey: 'endUserId' })
  declare endUser: BelongsTo<typeof EndUser>
}
