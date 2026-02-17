export const UI_LOCALES = ['en', 'fr', 'nl', 'es', 'de'] as const
export type SupportedUiLocale = (typeof UI_LOCALES)[number]

// Broad set of labels — covers UI locales + common content locales orgs may add
export const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  zh: '中文',
  ar: 'العربية',
  ko: '한국어',
  ru: 'Русский',
  pl: 'Polski',
  sv: 'Svenska',
  da: 'Dansk',
}

/**
 * Selects the best translation from a list, with locale fallback chain:
 * exact match → explicit fallback → first available
 */
export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
  fallback?: string,
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    (fallback ? translations.find((t) => t.locale === fallback) : undefined) ??
    translations[0]
  )
}
