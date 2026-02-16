import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * Pivot model for changelog entry labels.
 * This maps a changelog entry to a label string.
 */
export default class ChangelogLabel extends BaseModel {
  static table = 'changelog_labels'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'changelog_entry_id', serializeAs: 'changelogEntryId' })
  declare changelogEntryId: string

  @column({ columnName: 'label', serializeAs: 'label' })
  declare label: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime
}
