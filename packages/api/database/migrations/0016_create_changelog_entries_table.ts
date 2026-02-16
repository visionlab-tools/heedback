import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'changelog_entries'

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
        .uuid('author_id')
        .nullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('SET NULL')
      table.string('slug', 255).notNullable()
      table.string('cover_image_url', 2048).nullable()
      table.string('status', 50).notNullable().defaultTo('draft')
      table.specificType('labels', 'text[]').nullable()
      table.timestamp('published_at').nullable()
      table.timestamp('scheduled_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['organization_id', 'slug'])
      table.index(['organization_id', 'status'])
      table.index(['organization_id', 'published_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
