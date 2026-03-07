import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'end_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('first_name', 255).nullable()
      table.string('last_name', 255).nullable()
      table.string('position', 255).nullable()
      table.string('company', 255).nullable()
      table.string('pricing_plan', 255).nullable()
      table.string('language', 10).nullable()
    })

    // Migrate existing name → first_name
    this.defer(async (db) => {
      await db.rawQuery('UPDATE end_users SET first_name = name WHERE name IS NOT NULL')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name', 255).nullable()
    })

    this.defer(async (db) => {
      await db.rawQuery(
        `UPDATE end_users SET name = CONCAT_WS(' ', first_name, last_name) WHERE first_name IS NOT NULL`
      )
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('first_name', 'last_name', 'position', 'company', 'pricing_plan', 'language')
    })
  }
}
