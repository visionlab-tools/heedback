import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.string('logo_url', 2048).nullable()
      table.string('website_url', 2048).nullable()
      table.string('billing_email', 255).nullable()
      table.string('plan', 50).notNullable().defaultTo('free')
      table.jsonb('settings').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
