import { addMessages, init, locale } from 'svelte-i18n'
import { UI_LOCALES } from '@heedback/shared'
import type { SupportedUiLocale } from '@heedback/shared'

// Static imports so translations are available synchronously (SSR-safe)
import en from './locales/en.json'
import fr from './locales/fr.json'
import nl from './locales/nl.json'
import es from './locales/es.json'
import de from './locales/de.json'

const messages: Record<string, Record<string, unknown>> = { en, fr, nl, es, de }

for (const loc of UI_LOCALES) {
  addMessages(loc, messages[loc] ?? {})
}

/** Initializes svelte-i18n with a validated locale (falls back to 'en') */
export function initPortalI18n(loc: string) {
  const validLocale = UI_LOCALES.includes(loc as SupportedUiLocale) ? loc : 'en'
  init({ fallbackLocale: 'en', initialLocale: validLocale })
  locale.set(validLocale)
}
