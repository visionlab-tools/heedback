import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversation_reads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('admin_user_id')
        .notNullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('CASCADE')
      table
        .uuid('conversation_id')
        .notNullable()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE')
      table.timestamp('read_at').notNullable()

      table.unique(['admin_user_id', 'conversation_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
