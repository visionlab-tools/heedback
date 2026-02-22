import vine from '@vinejs/vine'

const attachmentSchema = vine.object({
  key: vine.string().trim().maxLength(500),
  name: vine.string().trim().maxLength(500),
  type: vine.string().trim().maxLength(100),
  size: vine.number().positive(),
})

export const createConversationValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().maxLength(500).optional().nullable(),
    body: vine.string().trim().minLength(1).maxLength(10000).optional(),
    channel: vine.enum(['widget', 'portal', 'email']).optional(),
    endUserId: vine.string().uuid().optional(),
    endUserExternalId: vine.string().trim().maxLength(255).optional(),
    endUserFirstName: vine.string().trim().maxLength(255).optional(),
    endUserLastName: vine.string().trim().maxLength(255).optional(),
    endUserEmail: vine.string().email().optional(),
    endUserAvatarUrl: vine.string().trim().maxLength(2048).optional(),
    attachments: vine.array(attachmentSchema).optional(),
    pageUrl: vine.string().trim().maxLength(2048).optional(),
  })
)

export const sendMessageValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(10000).optional(),
    isInternal: vine.boolean().optional(),
    attachments: vine.array(attachmentSchema).optional(),
  })
)

/** Public reply — accepts attachments and page URL */
export const publicReplyValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(10000).optional(),
    attachments: vine.array(attachmentSchema).optional(),
    pageUrl: vine.string().trim().maxLength(2048).optional(),
  })
)

export const updateConversationValidator = vine.compile(
  vine.object({
    status: vine.enum(['open', 'assigned', 'resolved', 'closed']).optional(),
    assignedToId: vine.string().uuid().optional().nullable(),
  })
)
