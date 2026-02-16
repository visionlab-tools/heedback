import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'

export default class ChangelogSubscriber extends BaseModel {
  static table = 'changelog_subscribers'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'email', serializeAs: 'email' })
  declare email: string

  @column({ columnName: 'is_confirmed', serializeAs: 'isConfirmed' })
  declare isConfirmed: boolean

  @column({ columnName: 'unsubscribe_token', serializeAs: null })
  declare unsubscribeToken: string

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
}
