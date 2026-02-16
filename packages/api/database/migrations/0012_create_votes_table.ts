import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'votes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE')
      table
        .uuid('end_user_id')
        .nullable()
        .references('id')
        .inTable('end_users')
        .onDelete('SET NULL')
      table
        .uuid('admin_user_id')
        .nullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()

      table.index(['post_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
