import vine from '@vinejs/vine'

export const createCollectionValidator = vine.compile(
  vine.object({
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    parentId: vine.string().uuid().optional().nullable(),
    icon: vine.string().maxLength(100).optional().nullable(),
    sortOrder: vine.number().min(0).optional(),
    isPublished: vine.boolean().optional(),
    translations: vine.array(
      vine.object({
        locale: vine.string().trim().minLength(2).maxLength(10),
        name: vine.string().trim().minLength(1).maxLength(255),
        description: vine.string().maxLength(5000).optional().nullable(),
      })
    ).minLength(1),
  })
)

export const updateCollectionValidator = vine.compile(
  vine.object({
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    parentId: vine.string().uuid().optional().nullable(),
    icon: vine.string().maxLength(100).optional().nullable(),
    sortOrder: vine.number().min(0).optional(),
    isPublished: vine.boolean().optional(),
    translations: vine.array(
      vine.object({
        locale: vine.string().trim().minLength(2).maxLength(10),
        name: vine.string().trim().minLength(1).maxLength(255),
        description: vine.string().maxLength(5000).optional().nullable(),
      })
    ).optional(),
  })
)

export const reorderCollectionsValidator = vine.compile(
  vine.object({
    items: vine.array(
      vine.object({
        id: vine.string().uuid(),
        sortOrder: vine.number().min(0),
      })
    ).minLength(1),
  })
)
