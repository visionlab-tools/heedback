import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import CollectionTranslation from '#models/collection_translation'
import Article from '#models/article'

export default class Collection extends BaseModel {
  static table = 'collections'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'parent_id', serializeAs: 'parentId' })
  declare parentId: string | null

  @column({ columnName: 'slug', serializeAs: 'slug' })
  declare slug: string

  @column({ columnName: 'icon', serializeAs: 'icon' })
  declare icon: string | null

  @column({ columnName: 'sort_order', serializeAs: 'sortOrder' })
  declare sortOrder: number

  @column({ columnName: 'is_published', serializeAs: 'isPublished' })
  declare isPublished: boolean

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

  @belongsTo(() => Collection, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Collection>

  @hasMany(() => Collection, { foreignKey: 'parentId' })
  declare children: HasMany<typeof Collection>

  @hasMany(() => CollectionTranslation, { foreignKey: 'collectionId' })
  declare translations: HasMany<typeof CollectionTranslation>

  @hasMany(() => Article, { foreignKey: 'collectionId' })
  declare articles: HasMany<typeof Article>
}
