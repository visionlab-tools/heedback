import vine from '@vinejs/vine'

export const createBoardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: vine.string().maxLength(5000).optional().nullable(),
    color: vine.string().maxLength(20).optional().nullable(),
    isPublic: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  })
)

export const updateBoardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: vine.string().maxLength(5000).optional().nullable(),
    color: vine.string().maxLength(20).optional().nullable(),
    isPublic: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  })
)
