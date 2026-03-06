import vine from '@vinejs/vine'

export const createInvitationValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().toLowerCase(),
    role: vine.enum(['owner', 'admin', 'member']),
  })
)

export const acceptInvitationValidator = vine.compile(
  vine.object({
    token: vine.string().fixedLength(64),
  })
)
