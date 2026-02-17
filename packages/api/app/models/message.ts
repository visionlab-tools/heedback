import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Conversation from '#models/conversation'
import EndUser from '#models/end_user'
import AdminUser from '#models/admin_user'

export default class Message extends BaseModel {
  static table = 'messages'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'conversation_id', serializeAs: 'conversationId' })
  declare conversationId: string

  @column({ columnName: 'sender_type', serializeAs: 'senderType' })
  declare senderType: 'end_user' | 'admin' | 'system'

  @column({ columnName: 'sender_id', serializeAs: 'senderId' })
  declare senderId: string | null

  @column({ columnName: 'body', serializeAs: 'body' })
  declare body: string

  @column({ columnName: 'is_internal', serializeAs: 'isInternal' })
  declare isInternal: boolean

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

  @belongsTo(() => Conversation, { foreignKey: 'conversationId' })
  declare conversation: BelongsTo<typeof Conversation>

  @belongsTo(() => EndUser, { foreignKey: 'senderId' })
  declare endUser: BelongsTo<typeof EndUser>

  @belongsTo(() => AdminUser, { foreignKey: 'senderId' })
  declare adminUser: BelongsTo<typeof AdminUser>
}
