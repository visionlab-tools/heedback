import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import Post from '#models/post'
import Vote from '#models/vote'
import Comment from '#models/comment'
import ArticleFeedback from '#models/article_feedback'

export default class EndUser extends BaseModel {
  static table = 'end_users'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'external_id', serializeAs: 'externalId' })
  declare externalId: string | null

  @column({ columnName: 'email', serializeAs: 'email' })
  declare email: string | null

  @column({ columnName: 'name', serializeAs: 'name' })
  declare name: string | null

  @column({ columnName: 'avatar_url', serializeAs: 'avatarUrl' })
  declare avatarUrl: string | null

  @column({ columnName: 'metadata', serializeAs: 'metadata' })
  declare metadata: Record<string, unknown> | null

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

  @hasMany(() => Post, { foreignKey: 'endUserId' })
  declare posts: HasMany<typeof Post>

  @hasMany(() => Vote, { foreignKey: 'endUserId' })
  declare votes: HasMany<typeof Vote>

  @hasMany(() => Comment, { foreignKey: 'endUserId' })
  declare comments: HasMany<typeof Comment>

  @hasMany(() => ArticleFeedback, { foreignKey: 'endUserId' })
  declare articleFeedbacks: HasMany<typeof ArticleFeedback>
}
