import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'

export default class GitCommit extends BaseModel {
  static table = 'git_commits'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'sha', serializeAs: 'sha' })
  declare sha: string

  @column({ columnName: 'message', serializeAs: 'message' })
  declare message: string

  @column({ columnName: 'diff_summary', serializeAs: 'diffSummary' })
  declare diffSummary: string | null

  @column({ columnName: 'author_name', serializeAs: 'authorName' })
  declare authorName: string

  @column({ columnName: 'author_email', serializeAs: 'authorEmail' })
  declare authorEmail: string

  @column.dateTime({ columnName: 'committed_at', serializeAs: 'committedAt' })
  declare committedAt: DateTime

  @column({ columnName: 'branch', serializeAs: 'branch' })
  declare branch: string

  @column({ columnName: 'processed', serializeAs: 'processed' })
  declare processed: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime

  @belongsTo(() => Organization, { foreignKey: 'organizationId' })
  declare organization: BelongsTo<typeof Organization>
}
