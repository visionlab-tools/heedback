import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('attachments').defaultTo('[]')
      table.string('page_url', 2048).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('attachments')
      table.dropColumn('page_url')
    })
  }
}
