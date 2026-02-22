import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'git_commits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('organization_id')
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.string('sha', 40).notNullable()
      table.text('message').notNullable()
      table.text('diff_summary').nullable()
      table.string('author_name', 255).notNullable()
      table.string('author_email', 255).notNullable()
      table.timestamp('committed_at').notNullable()
      table.string('branch', 255).notNullable()
      table.boolean('processed').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['organization_id', 'sha'])
      table.index(['organization_id', 'processed'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
