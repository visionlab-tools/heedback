import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import Post from '#models/post'

export default class Tag extends BaseModel {
  static table = 'tags'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'name', serializeAs: 'name' })
  declare name: string

  @column({ columnName: 'slug', serializeAs: 'slug' })
  declare slug: string

  @column({ columnName: 'color', serializeAs: 'color' })
  declare color: string | null

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

  @manyToMany(() => Post, {
    pivotTable: 'post_tags',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'post_id',
    pivotTimestamps: true,
  })
  declare posts: ManyToMany<typeof Post>
}
