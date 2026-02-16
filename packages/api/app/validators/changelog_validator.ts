import vine from '@vinejs/vine'

export const createChangelogEntryValidator = vine.compile(
  vine.object({
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    coverImageUrl: vine.string().url().maxLength(2048).optional().nullable(),
    status: vine.enum(['draft', 'published', 'scheduled']).optional(),
    labels: vine.array(vine.string().maxLength(100)).optional().nullable(),
    scheduledAt: vine.string().optional().nullable(),
    linkedPostIds: vine.array(vine.string().uuid()).optional(),
    translations: vine.array(
      vine.object({
        locale: vine.string().trim().minLength(2).maxLength(10),
        title: vine.string().trim().minLength(1).maxLength(500),
        body: vine.string().optional().nullable(),
        excerpt: vine.string().maxLength(1000).optional().nullable(),
      })
    ).minLength(1),
  })
)

export const updateChangelogEntryValidator = vine.compile(
  vine.object({
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    coverImageUrl: vine.string().url().maxLength(2048).optional().nullable(),
    status: vine.enum(['draft', 'published', 'scheduled']).optional(),
    labels: vine.array(vine.string().maxLength(100)).optional().nullable(),
    scheduledAt: vine.string().optional().nullable(),
    linkedPostIds: vine.array(vine.string().uuid()).optional(),
    translations: vine.array(
      vine.object({
        locale: vine.string().trim().minLength(2).maxLength(10),
        title: vine.string().trim().minLength(1).maxLength(500),
        body: vine.string().optional().nullable(),
        excerpt: vine.string().maxLength(1000).optional().nullable(),
      })
    ).optional(),
  })
)

export const subscribeChangelogValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
  })
)
