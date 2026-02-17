import { register, init, locale } from 'svelte-i18n'
import type { SupportedUiLocale } from '@heedback/shared'
import { UI_LOCALES } from '@heedback/shared'

for (const loc of UI_LOCALES) {
  register(loc, () => import(`./${loc}.json`))
}

export function getStoredLocale(): string {
  const stored = localStorage.getItem('hb_ui_locale')
  return UI_LOCALES.includes(stored as SupportedUiLocale) ? stored! : 'en'
}

export function setUiLocale(newLocale: string) {
  locale.set(newLocale)
  localStorage.setItem('hb_ui_locale', newLocale)
}

export function initI18n() {
  return init({ fallbackLocale: 'en', initialLocale: getStoredLocale() })
}
