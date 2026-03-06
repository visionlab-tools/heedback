import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import AdminUser from '#models/admin_user'

export default class OrgInvitation extends BaseModel {
  static table = 'org_invitations'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id', serializeAs: 'organizationId' })
  declare organizationId: string

  @column({ columnName: 'email', serializeAs: 'email' })
  declare email: string

  @column({ columnName: 'role', serializeAs: 'role' })
  declare role: 'owner' | 'admin' | 'member'

  @column({ columnName: 'token_hash', serializeAs: null })
  declare tokenHash: string

  @column({ columnName: 'invited_by_id', serializeAs: 'invitedById' })
  declare invitedById: string | null

  @column({ columnName: 'status', serializeAs: 'status' })
  declare status: 'pending' | 'accepted' | 'revoked'

  @column.dateTime({ columnName: 'expires_at', serializeAs: 'expiresAt' })
  declare expiresAt: DateTime

  @column.dateTime({ columnName: 'accepted_at', serializeAs: 'acceptedAt' })
  declare acceptedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime

  get isExpired(): boolean {
    return this.expiresAt < DateTime.now()
  }

  /*
  |--------------------------------------------------------------------------
  | Relationships
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Organization, { foreignKey: 'organizationId' })
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => AdminUser, { foreignKey: 'invitedById' })
  declare invitedBy: BelongsTo<typeof AdminUser>
}
