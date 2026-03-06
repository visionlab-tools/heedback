import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('org_members', (table) => {
      table.timestamp('last_digest_sent_at').nullable()
    })

    this.schema.alterTable('end_users', (table) => {
      table.timestamp('last_digest_sent_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('org_members', (table) => {
      table.dropColumn('last_digest_sent_at')
    })

    this.schema.alterTable('end_users', (table) => {
      table.dropColumn('last_digest_sent_at')
    })
  }
}
