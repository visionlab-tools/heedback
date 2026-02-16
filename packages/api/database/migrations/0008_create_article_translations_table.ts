import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'article_translations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('article_id')
        .notNullable()
        .references('id')
        .inTable('articles')
        .onDelete('CASCADE')
      table.string('locale', 10).notNullable()
      table.string('title', 500).notNullable()
      table.text('body').nullable()
      table.string('meta_title', 500).nullable()
      table.text('meta_description').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['article_id', 'locale'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
