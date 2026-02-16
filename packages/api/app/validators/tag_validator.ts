import vine from '@vinejs/vine'

export const createTagValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    color: vine.string().maxLength(20).optional().nullable(),
  })
)

export const updateTagValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    color: vine.string().maxLength(20).optional().nullable(),
  })
)
