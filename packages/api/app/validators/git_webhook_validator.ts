import vine from '@vinejs/vine'

export const generateChangelogValidator = vine.compile(
  vine.object({
    locales: vine.array(vine.string().trim().minLength(2).maxLength(10)).optional(),
  })
)
