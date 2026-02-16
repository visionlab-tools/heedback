import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

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
        .uuid('collection_id')
        .nullable()
        .references('id')
        .inTable('collections')
        .onDelete('SET NULL')
      table
        .uuid('author_id')
        .nullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('SET NULL')
      table.string('slug', 255).notNullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.string('status', 50).notNullable().defaultTo('draft')
      table.timestamp('published_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['organization_id', 'slug'])
      table.index(['organization_id', 'status'])
      table.index(['collection_id', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
