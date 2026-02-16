import vine from '@vinejs/vine'

export const createCommentValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(10000),
    parentId: vine.string().uuid().optional().nullable(),
    isInternal: vine.boolean().optional(),
  })
)

export const updateCommentValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(10000),
  })
)
