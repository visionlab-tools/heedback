import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import Post from '#models/post'

export default class Board extends BaseModel {
  static table = 'boards'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'name', serializeAs: 'name' })
  declare name: string

  @column({ columnName: 'slug', serializeAs: 'slug' })
  declare slug: string

  @column({ columnName: 'description', serializeAs: 'description' })
  declare description: string | null

  @column({ columnName: 'color', serializeAs: 'color' })
  declare color: string | null

  @column({ columnName: 'is_public', serializeAs: 'isPublic' })
  declare isPublic: boolean

  @column({ columnName: 'sort_order', serializeAs: 'sortOrder' })
  declare sortOrder: number

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

  @hasMany(() => Post, { foreignKey: 'boardId' })
  declare posts: HasMany<typeof Post>
}
