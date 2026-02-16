import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'changelog_labels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('changelog_entry_id')
        .notNullable()
        .references('id')
        .inTable('changelog_entries')
        .onDelete('CASCADE')
      table.string('label', 100).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['changelog_entry_id', 'label'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
