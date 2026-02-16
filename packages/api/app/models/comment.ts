import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import EndUser from '#models/end_user'
import AdminUser from '#models/admin_user'

export default class Comment extends BaseModel {
  static table = 'comments'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'post_id', serializeAs: 'postId' })
  declare postId: string

  @column({ columnName: 'parent_id', serializeAs: 'parentId' })
  declare parentId: string | null

  @column({ columnName: 'end_user_id', serializeAs: 'endUserId' })
  declare endUserId: string | null

  @column({ columnName: 'admin_user_id', serializeAs: 'adminUserId' })
  declare adminUserId: string | null

  @column({ columnName: 'body', serializeAs: 'body' })
  declare body: string

  @column({ columnName: 'is_internal', serializeAs: 'isInternal' })
  declare isInternal: boolean

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

  @belongsTo(() => Post, { foreignKey: 'postId' })
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Comment, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Comment>

  @hasMany(() => Comment, { foreignKey: 'parentId' })
  declare replies: HasMany<typeof Comment>

  @belongsTo(() => EndUser, { foreignKey: 'endUserId' })
  declare endUser: BelongsTo<typeof EndUser>

  @belongsTo(() => AdminUser, { foreignKey: 'adminUserId' })
  declare adminUser: BelongsTo<typeof AdminUser>
}
