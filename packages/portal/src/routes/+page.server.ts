import { redirect } from '@sveltejs/kit'
import { UI_LOCALES } from '@heedback/shared'
import type { PageServerLoad } from './$types'
import type { SupportedUiLocale } from '@heedback/shared'

/** Redirects bare "/" to "/{detected_locale}" based on Accept-Language header */
export const load: PageServerLoad = async ({ request }) => {
  const acceptLang = request.headers.get('accept-language')
  const preferred = acceptLang?.split(',')[0]?.split('-')[0] ?? 'en'
  const locale = UI_LOCALES.includes(preferred as SupportedUiLocale) ? preferred : 'en'
  redirect(302, `/${locale}`)
}
