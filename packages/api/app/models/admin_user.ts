import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import OrgMember from '#models/org_member'
import Comment from '#models/comment'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class AdminUser extends compose(BaseModel, AuthFinder) {
  static table = 'admin_users'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'email', serializeAs: 'email' })
  declare email: string

  @column({ columnName: 'password', serializeAs: null })
  declare password: string

  @column({ columnName: 'full_name', serializeAs: 'fullName' })
  declare fullName: string

  @column({ columnName: 'avatar_url', serializeAs: 'avatarUrl' })
  declare avatarUrl: string | null

  @column({ columnName: 'is_super_admin', serializeAs: 'isSuperAdmin' })
  declare isSuperAdmin: boolean

  @column.dateTime({ columnName: 'last_login_at', serializeAs: 'lastLoginAt' })
  declare lastLoginAt: DateTime | null

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

  @hasMany(() => OrgMember, { foreignKey: 'adminUserId' })
  declare orgMemberships: HasMany<typeof OrgMember>

  @hasMany(() => Comment, { foreignKey: 'adminUserId' })
  declare comments: HasMany<typeof Comment>
}
