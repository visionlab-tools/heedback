import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PostTag extends BaseModel {
  static table = 'post_tags'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'post_id', serializeAs: 'postId' })
  declare postId: string

  @column({ columnName: 'tag_id', serializeAs: 'tagId' })
  declare tagId: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime
}
