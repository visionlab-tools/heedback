import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AdminUser from '#models/admin_user'

export default class PushSubscription extends BaseModel {
  static table = 'push_subscriptions'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'admin_user_id', serializeAs: 'adminUserId' })
  declare adminUserId: string

  @column()
  declare endpoint: string

  @column()
  declare p256dh: string

  @column()
  declare auth: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime

  @belongsTo(() => AdminUser, { foreignKey: 'adminUserId' })
  declare adminUser: BelongsTo<typeof AdminUser>
}
