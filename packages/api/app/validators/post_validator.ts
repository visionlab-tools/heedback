import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    boardId: vine.string().uuid(),
    title: vine.string().trim().minLength(1).maxLength(500),
    body: vine.string().maxLength(10000).optional().nullable(),
    status: vine
      .enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed'])
      .optional(),
    tagIds: vine.array(vine.string().uuid()).optional(),
    eta: vine.string().maxLength(100).optional().nullable(),
  })
)

export const updatePostValidator = vine.compile(
  vine.object({
    boardId: vine.string().uuid().optional(),
    title: vine.string().trim().minLength(1).maxLength(500).optional(),
    body: vine.string().maxLength(10000).optional().nullable(),
    status: vine
      .enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed'])
      .optional(),
    tagIds: vine.array(vine.string().uuid()).optional(),
    eta: vine.string().maxLength(100).optional().nullable(),
  })
)

export const mergePostValidator = vine.compile(
  vine.object({
    targetPostId: vine.string().uuid(),
  })
)
