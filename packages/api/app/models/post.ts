import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import Board from '#models/board'
import EndUser from '#models/end_user'
import AdminUser from '#models/admin_user'
import Vote from '#models/vote'
import Comment from '#models/comment'
import Tag from '#models/tag'

export default class Post extends BaseModel {
  static table = 'posts'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'board_id', serializeAs: 'boardId' })
  declare boardId: string

  @column({ columnName: 'end_user_id', serializeAs: 'endUserId' })
  declare endUserId: string | null

  @column({ columnName: 'admin_user_id', serializeAs: 'adminUserId' })
  declare adminUserId: string | null

  @column({ columnName: 'title', serializeAs: 'title' })
  declare title: string

  @column({ columnName: 'body', serializeAs: 'body' })
  declare body: string | null

  @column({ columnName: 'status', serializeAs: 'status' })
  declare status: 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'closed'

  @column({ columnName: 'vote_count', serializeAs: 'voteCount' })
  declare voteCount: number

  @column({ columnName: 'comment_count', serializeAs: 'commentCount' })
  declare commentCount: number

  @column({ columnName: 'merged_into_id', serializeAs: 'mergedIntoId' })
  declare mergedIntoId: string | null

  @column({ columnName: 'eta', serializeAs: 'eta' })
  declare eta: string | null

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

  @belongsTo(() => Organization, { foreignKey: 'organizationId' })
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => Board, { foreignKey: 'boardId' })
  declare board: BelongsTo<typeof Board>

  @belongsTo(() => EndUser, { foreignKey: 'endUserId' })
  declare endUser: BelongsTo<typeof EndUser>

  @belongsTo(() => AdminUser, { foreignKey: 'adminUserId' })
  declare adminUser: BelongsTo<typeof AdminUser>

  @belongsTo(() => Post, { foreignKey: 'mergedIntoId' })
  declare mergedInto: BelongsTo<typeof Post>

  @hasMany(() => Post, { foreignKey: 'mergedIntoId' })
  declare mergedPosts: HasMany<typeof Post>

  @hasMany(() => Vote, { foreignKey: 'postId' })
  declare votes: HasMany<typeof Vote>

  @hasMany(() => Comment, { foreignKey: 'postId' })
  declare comments: HasMany<typeof Comment>

  @manyToMany(() => Tag, {
    pivotTable: 'post_tags',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'post_id',
    pivotRelatedForeignKey: 'tag_id',
    pivotTimestamps: true,
  })
  declare tags: ManyToMany<typeof Tag>
}
