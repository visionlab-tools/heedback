import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * Pivot model linking changelog entries to feedback posts.
 */
export default class ChangelogPost extends BaseModel {
  static table = 'changelog_posts'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'changelog_entry_id', serializeAs: 'changelogEntryId' })
  declare changelogEntryId: string

  @column({ columnName: 'post_id', serializeAs: 'postId' })
  declare postId: string

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
