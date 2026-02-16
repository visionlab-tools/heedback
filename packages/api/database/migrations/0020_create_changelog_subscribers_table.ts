import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'changelog_subscribers'

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
      table.boolean('is_confirmed').notNullable().defaultTo(false)
      table.string('unsubscribe_token', 255).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['organization_id', 'email'])
      table.index(['unsubscribe_token'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
