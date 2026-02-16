import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Collection from '#models/collection'

export default class CollectionTranslation extends BaseModel {
  static table = 'collection_translations'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'collection_id', serializeAs: 'collectionId' })
  declare collectionId: string

  @column({ columnName: 'locale', serializeAs: 'locale' })
  declare locale: string

  @column({ columnName: 'name', serializeAs: 'name' })
  declare name: string

  @column({ columnName: 'description', serializeAs: 'description' })
  declare description: string | null

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

  @belongsTo(() => Collection, { foreignKey: 'collectionId' })
  declare collection: BelongsTo<typeof Collection>
}
