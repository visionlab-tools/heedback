import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('organization_id')
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table
        .uuid('end_user_id')
        .nullable()
        .references('id')
        .inTable('end_users')
        .onDelete('SET NULL')
      table.string('subject', 500).nullable()
      table.string('status', 50).notNullable().defaultTo('open')
      table.string('channel', 50).notNullable().defaultTo('widget')
      table
        .uuid('assigned_to_id')
        .nullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('SET NULL')
      table.integer('message_count').notNullable().defaultTo(0)
      table.timestamp('last_message_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['organization_id', 'status'])
      table.index(['organization_id', 'last_message_at'])
      table.index(['assigned_to_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
