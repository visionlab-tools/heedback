import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import AdminUser from '#models/admin_user'
import ChangelogEntryTranslation from '#models/changelog_entry_translation'
import Post from '#models/post'

export default class ChangelogEntry extends BaseModel {
  static table = 'changelog_entries'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'author_id', serializeAs: 'authorId' })
  declare authorId: string | null

  @column({ columnName: 'slug', serializeAs: 'slug' })
  declare slug: string

  @column({ columnName: 'cover_image_url', serializeAs: 'coverImageUrl' })
  declare coverImageUrl: string | null

  @column({ columnName: 'status', serializeAs: 'status' })
  declare status: 'draft' | 'published' | 'scheduled'

  @column({ columnName: 'labels', serializeAs: 'labels' })
  declare labels: string[] | null

  @column.dateTime({ columnName: 'published_at', serializeAs: 'publishedAt' })
  declare publishedAt: DateTime | null

  @column.dateTime({ columnName: 'scheduled_at', serializeAs: 'scheduledAt' })
  declare scheduledAt: DateTime | null

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

  @belongsTo(() => AdminUser, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof AdminUser>

  @hasMany(() => ChangelogEntryTranslation, { foreignKey: 'changelogEntryId' })
  declare translations: HasMany<typeof ChangelogEntryTranslation>

  @manyToMany(() => Post, {
    pivotTable: 'changelog_posts',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'changelog_entry_id',
    pivotRelatedForeignKey: 'post_id',
    pivotTimestamps: true,
  })
  declare linkedPosts: ManyToMany<typeof Post>
}
