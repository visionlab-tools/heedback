import { error } from '@sveltejs/kit'
import { UI_LOCALES } from '@heedback/shared'
import type { LayoutServerLoad } from './$types'
import type { SupportedUiLocale } from '@heedback/shared'

/** Validates the locale param — returns 404 for unsupported locales */
export const load: LayoutServerLoad = async ({ params }) => {
  if (!UI_LOCALES.includes(params.locale as SupportedUiLocale)) {
    throw error(404, 'Unknown locale')
  }
  return { locale: params.locale }
}
