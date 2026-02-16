import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import Collection from '#models/collection'
import ArticleTranslation from '#models/article_translation'
import ArticleFeedback from '#models/article_feedback'
import AdminUser from '#models/admin_user'

export default class Article extends BaseModel {
  static table = 'articles'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'collection_id', serializeAs: 'collectionId' })
  declare collectionId: string | null

  @column({ columnName: 'author_id', serializeAs: 'authorId' })
  declare authorId: string | null

  @column({ columnName: 'slug', serializeAs: 'slug' })
  declare slug: string

  @column({ columnName: 'sort_order', serializeAs: 'sortOrder' })
  declare sortOrder: number

  @column({ columnName: 'status', serializeAs: 'status' })
  declare status: 'draft' | 'published' | 'archived'

  @column.dateTime({ columnName: 'published_at', serializeAs: 'publishedAt' })
  declare publishedAt: DateTime | null

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

  @belongsTo(() => Collection, { foreignKey: 'collectionId' })
  declare collection: BelongsTo<typeof Collection>

  @belongsTo(() => AdminUser, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof AdminUser>

  @hasMany(() => ArticleTranslation, { foreignKey: 'articleId' })
  declare translations: HasMany<typeof ArticleTranslation>

  @hasMany(() => ArticleFeedback, { foreignKey: 'articleId' })
  declare feedbacks: HasMany<typeof ArticleFeedback>
}
