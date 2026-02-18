import vine from '@vinejs/vine'

export const createOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    logoUrl: vine.string().maxLength(2048).optional().nullable(),
    websiteUrl: vine.string().url().maxLength(2048).optional().nullable(),
    billingEmail: vine.string().email().maxLength(255).optional().nullable(),
    settings: vine.object({}).allowUnknownProperties().optional().nullable(),
  })
)

export const updateOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    logoUrl: vine.string().maxLength(2048).optional().nullable(),
    websiteUrl: vine.string().url().maxLength(2048).optional().nullable(),
    billingEmail: vine.string().email().maxLength(255).optional().nullable(),
    settings: vine.object({}).allowUnknownProperties().optional().nullable(),
  })
)

export const addMemberValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    role: vine.enum(['owner', 'admin', 'member']),
  })
)

export const updateMemberValidator = vine.compile(
  vine.object({
    role: vine.enum(['owner', 'admin', 'member']),
  })
)
