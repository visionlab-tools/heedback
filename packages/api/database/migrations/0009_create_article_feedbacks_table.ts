import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'article_feedbacks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('article_id')
        .notNullable()
        .references('id')
        .inTable('articles')
        .onDelete('CASCADE')
      table
        .uuid('end_user_id')
        .nullable()
        .references('id')
        .inTable('end_users')
        .onDelete('SET NULL')
      table.string('reaction', 20).notNullable()
      table.text('comment').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['article_id', 'reaction'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
