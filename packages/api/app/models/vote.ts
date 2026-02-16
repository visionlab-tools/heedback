import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import EndUser from '#models/end_user'
import AdminUser from '#models/admin_user'

export default class Vote extends BaseModel {
  static table = 'votes'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'post_id', serializeAs: 'postId' })
  declare postId: string

  @column({ columnName: 'end_user_id', serializeAs: 'endUserId' })
  declare endUserId: string | null

  @column({ columnName: 'admin_user_id', serializeAs: 'adminUserId' })
  declare adminUserId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relationships
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Post, { foreignKey: 'postId' })
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => EndUser, { foreignKey: 'endUserId' })
  declare endUser: BelongsTo<typeof EndUser>

  @belongsTo(() => AdminUser, { foreignKey: 'adminUserId' })
  declare adminUser: BelongsTo<typeof AdminUser>
}
