import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { resolveStorageUrl } from '#helpers/storage'
import OrgMember from '#models/org_member'
import Collection from '#models/collection'
import Board from '#models/board'
import Tag from '#models/tag'
import ChangelogEntry from '#models/changelog_entry'
import ChangelogSubscriber from '#models/changelog_subscriber'

export default class Organization extends BaseModel {
  static table = 'organizations'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'name', serializeAs: 'name' })
  declare name: string

  @column({ columnName: 'slug', serializeAs: 'slug' })
  declare slug: string

  @column({ columnName: 'logo_url', serializeAs: 'logoUrl' })
  declare logoUrl: string | null

  @column({ columnName: 'website_url', serializeAs: 'websiteUrl' })
  declare websiteUrl: string | null

  @column({ columnName: 'billing_email', serializeAs: 'billingEmail' })
  declare billingEmail: string | null

  @column({ columnName: 'plan', serializeAs: 'plan' })
  declare plan: string

  @column({ columnName: 'settings', serializeAs: 'settings' })
  declare settings: Record<string, unknown> | null

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

  /**
   * Resolve logoUrl storage key to a full public URL at serialization time.
   * The DB stores only the S3 key so endpoint changes don't break stored data.
   */
  override serialize() {
    const json = super.serialize()
    json.logoUrl = resolveStorageUrl(this.logoUrl)
    return json
  }

  @hasMany(() => OrgMember, { foreignKey: 'organizationId' })
  declare members: HasMany<typeof OrgMember>

  @hasMany(() => Collection, { foreignKey: 'organizationId' })
  declare collections: HasMany<typeof Collection>

  @hasMany(() => Board, { foreignKey: 'organizationId' })
  declare boards: HasMany<typeof Board>

  @hasMany(() => Tag, { foreignKey: 'organizationId' })
  declare tags: HasMany<typeof Tag>

  @hasMany(() => ChangelogEntry, { foreignKey: 'organizationId' })
  declare changelogEntries: HasMany<typeof ChangelogEntry>

  @hasMany(() => ChangelogSubscriber, { foreignKey: 'organizationId' })
  declare changelogSubscribers: HasMany<typeof ChangelogSubscriber>
}
