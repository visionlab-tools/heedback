import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('organization_id')
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.uuid('board_id').notNullable().references('id').inTable('boards').onDelete('CASCADE')
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
      table.string('title', 500).notNullable()
      table.text('body').nullable()
      table.string('status', 50).notNullable().defaultTo('open')
      table.integer('vote_count').notNullable().defaultTo(0)
      table.integer('comment_count').notNullable().defaultTo(0)
      table.uuid('merged_into_id').nullable().references('id').inTable('posts').onDelete('SET NULL')
      table.string('eta', 100).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['organization_id', 'status'])
      table.index(['board_id', 'vote_count'])
      table.index(['organization_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
