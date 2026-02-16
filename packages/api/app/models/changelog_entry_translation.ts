import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ChangelogEntry from '#models/changelog_entry'

export default class ChangelogEntryTranslation extends BaseModel {
  static table = 'changelog_entry_translations'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'changelog_entry_id', serializeAs: 'changelogEntryId' })
  declare changelogEntryId: string

  @column({ columnName: 'locale', serializeAs: 'locale' })
  declare locale: string

  @column({ columnName: 'title', serializeAs: 'title' })
  declare title: string

  @column({ columnName: 'body', serializeAs: 'body' })
  declare body: string | null

  @column({ columnName: 'excerpt', serializeAs: 'excerpt' })
  declare excerpt: string | null

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

  @belongsTo(() => ChangelogEntry, { foreignKey: 'changelogEntryId' })
  declare changelogEntry: BelongsTo<typeof ChangelogEntry>
}
