import { addMessages, init, locale } from 'svelte-i18n'
import type { SupportedUiLocale } from '@heedback/shared'
import { UI_LOCALES } from '@heedback/shared'

import en from './en.json'
import fr from './fr.json'
import nl from './nl.json'
import es from './es.json'
import de from './de.json'

const messages: Record<string, Record<string, unknown>> = { en, fr, nl, es, de }

for (const loc of UI_LOCALES) {
  addMessages(loc, messages[loc] ?? {})
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
  init({ fallbackLocale: 'en', initialLocale: getStoredLocale() })
}
