import { register, init } from 'svelte-i18n'
import { UI_LOCALES } from '@heedback/shared'
import type { SupportedUiLocale } from '@heedback/shared'

// Register all supported locale files for lazy-loading
for (const loc of UI_LOCALES) {
  register(loc, () => import(`./${loc}.json`))
}

/** Initializes svelte-i18n with a validated locale (falls back to 'en') */
export function initPortalI18n(loc: string) {
  const validLocale = UI_LOCALES.includes(loc as SupportedUiLocale) ? loc : 'en'
  return init({ fallbackLocale: 'en', initialLocale: validLocale })
}
