import { DateTime } from 'luxon'
import { BaseModel, column, computed, belongsTo, hasMany } from '@adonisjs/lucid/orm'
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

  @column({ columnName: 'first_name', serializeAs: 'firstName' })
  declare firstName: string | null

  @column({ columnName: 'last_name', serializeAs: 'lastName' })
  declare lastName: string | null

  @column({ columnName: 'avatar_url', serializeAs: 'avatarUrl' })
  declare avatarUrl: string | null

  @column({ columnName: 'position', serializeAs: 'position' })
  declare position: string | null

  @column({ columnName: 'company', serializeAs: 'company' })
  declare company: string | null

  @column({ columnName: 'pricing_plan', serializeAs: 'pricingPlan' })
  declare pricingPlan: string | null

  @column({ columnName: 'language', serializeAs: 'language' })
  declare language: string | null

  @column({ columnName: 'metadata', serializeAs: 'metadata' })
  declare metadata: Record<string, string | number> | null

  @computed()
  get displayName(): string | null {
    if (!this.firstName) return null
    return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName
  }

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'last_digest_sent_at', serializeAs: 'lastDigestSentAt' })
  declare lastDigestSentAt: DateTime | null

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
