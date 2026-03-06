import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'org_invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('organization_id')
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.string('email', 255).notNullable()
      table.string('role', 50).notNullable().defaultTo('member')
      table.string('token_hash', 255).notNullable().unique()
      table
        .uuid('invited_by_id')
        .nullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('SET NULL')
      table.string('status', 50).notNullable().defaultTo('pending')
      table.timestamp('expires_at').notNullable()
      table.timestamp('accepted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })

    // Only one pending invitation per email per org
    this.schema.raw(`
      CREATE UNIQUE INDEX org_invitations_org_email_pending
      ON org_invitations (organization_id, email)
      WHERE status = 'pending'
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
