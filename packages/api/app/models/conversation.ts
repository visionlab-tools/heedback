import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import EndUser from '#models/end_user'
import AdminUser from '#models/admin_user'
import Message from '#models/message'

export default class Conversation extends BaseModel {
  static table = 'conversations'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'end_user_id', serializeAs: 'endUserId' })
  declare endUserId: string | null

  @column({ columnName: 'subject', serializeAs: 'subject' })
  declare subject: string | null

  @column({ columnName: 'status', serializeAs: 'status' })
  declare status: 'open' | 'assigned' | 'resolved' | 'closed'

  @column({ columnName: 'channel', serializeAs: 'channel' })
  declare channel: 'widget' | 'portal' | 'email'

  @column({ columnName: 'assigned_to_id', serializeAs: 'assignedToId' })
  declare assignedToId: string | null

  @column({ columnName: 'message_count', serializeAs: 'messageCount' })
  declare messageCount: number

  @column.dateTime({ columnName: 'last_message_at', serializeAs: 'lastMessageAt' })
  declare lastMessageAt: DateTime | null

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

  @belongsTo(() => EndUser, { foreignKey: 'endUserId' })
  declare endUser: BelongsTo<typeof EndUser>

  @belongsTo(() => AdminUser, { foreignKey: 'assignedToId' })
  declare assignedTo: BelongsTo<typeof AdminUser>

  @hasMany(() => Message, { foreignKey: 'conversationId' })
  declare messages: HasMany<typeof Message>
}
