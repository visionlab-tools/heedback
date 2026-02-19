import vine from '@vinejs/vine'

export const createConversationValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().maxLength(500).optional().nullable(),
    body: vine.string().trim().minLength(1).maxLength(10000),
    channel: vine.enum(['widget', 'portal', 'email']).optional(),
    endUserId: vine.string().uuid().optional(),
    endUserExternalId: vine.string().trim().maxLength(255).optional(),
    endUserFirstName: vine.string().trim().maxLength(255).optional(),
    endUserLastName: vine.string().trim().maxLength(255).optional(),
    endUserEmail: vine.string().email().optional(),
    endUserAvatarUrl: vine.string().trim().maxLength(2048).optional(),
  })
)

export const sendMessageValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(10000),
    isInternal: vine.boolean().optional(),
  })
)

export const updateConversationValidator = vine.compile(
  vine.object({
    status: vine.enum(['open', 'assigned', 'resolved', 'closed']).optional(),
    assignedToId: vine.string().uuid().optional().nullable(),
  })
)
