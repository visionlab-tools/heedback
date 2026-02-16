import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collections'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('organization_id')
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.uuid('parent_id').nullable().references('id').inTable('collections').onDelete('SET NULL')
      table.string('slug', 255).notNullable()
      table.string('icon', 100).nullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.boolean('is_published').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['organization_id', 'slug'])
      table.index(['organization_id', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
