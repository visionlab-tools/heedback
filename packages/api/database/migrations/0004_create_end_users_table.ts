import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'end_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('organization_id')
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.string('external_id', 255).nullable()
      table.string('email', 255).nullable()
      table.string('name', 255).nullable()
      table.string('avatar_url', 2048).nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['organization_id', 'external_id'])
      table.index(['organization_id', 'email'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
