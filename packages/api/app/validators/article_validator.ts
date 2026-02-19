import vine from '@vinejs/vine'

export const createArticleValidator = vine.compile(
  vine.object({
    collectionId: vine.string().uuid().optional().nullable(),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    sortOrder: vine.number().min(0).optional(),
    status: vine.enum(['draft', 'published', 'archived']).optional(),
    tagIds: vine.array(vine.string().uuid()).optional(),
    translations: vine.array(
      vine.object({
        locale: vine.string().trim().minLength(2).maxLength(10),
        title: vine.string().trim().minLength(1).maxLength(500),
        body: vine.string().optional().nullable(),
        metaTitle: vine.string().maxLength(500).optional().nullable(),
        metaDescription: vine.string().maxLength(2000).optional().nullable(),
      })
    ).minLength(1),
  })
)

export const updateArticleValidator = vine.compile(
  vine.object({
    collectionId: vine.string().uuid().optional().nullable(),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    sortOrder: vine.number().min(0).optional(),
    status: vine.enum(['draft', 'published', 'archived']).optional(),
    tagIds: vine.array(vine.string().uuid()).optional(),
    translations: vine.array(
      vine.object({
        locale: vine.string().trim().minLength(2).maxLength(10),
        title: vine.string().trim().minLength(1).maxLength(500),
        body: vine.string().optional().nullable(),
        metaTitle: vine.string().maxLength(500).optional().nullable(),
        metaDescription: vine.string().maxLength(2000).optional().nullable(),
      })
    ).optional(),
  })
)

export const articleFeedbackValidator = vine.compile(
  vine.object({
    reaction: vine.enum(['helpful', 'not_helpful']),
    comment: vine.string().maxLength(2000).optional().nullable(),
    endUserId: vine.string().uuid().optional().nullable(),
  })
)

export const articleSearchValidator = vine.compile(
  vine.object({
    q: vine.string().trim().minLength(1).maxLength(500),
    locale: vine.string().trim().minLength(2).maxLength(10).optional(),
    collectionId: vine.string().uuid().optional(),
  })
)
