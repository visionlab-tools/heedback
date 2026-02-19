import { navigate } from '../lib/router.svelte.ts'
import { api } from '../lib/api/client'
import { currentOrg } from '../lib/stores/org'

export const allLabels = ['new', 'improvement', 'fix', 'breaking']

interface TranslationDraft {
  locale: string
  title: string
  body: string
}

export function createChangelogEditorState(id?: string) {
  let orgId = $state('')
  let slug = $state('')
  let status = $state<'draft' | 'scheduled' | 'published'>('draft')
  let labels = $state<string[]>([])
  let scheduledAt = $state('')
  let saving = $state(false)
  let error = $state('')

  // Multi-locale support
  let orgLocales = $state<string[]>(['en'])
  let activeLocale = $state('en')
  let translations = $state<TranslationDraft[]>([{ locale: 'en', title: '', body: '' }])

  let isEdit = $derived(!!id)

  currentOrg.subscribe((org) => {
    if (!org) return
    orgId = org.id
    const locales = (org.settings as Record<string, unknown>)?.supportedLocales as string[] | undefined
    if (locales?.length) {
      orgLocales = locales
      translations = locales.map((loc) => translations.find((t) => t.locale === loc) ?? { locale: loc, title: '', body: '' })
    }
  })

  async function load() {
    if (!isEdit || !orgId) return
    try {
      const data = await api.get<{ data: any }>(`/org/${orgId}/changelog/${id}`)
      const entry = data.data
      slug = entry.slug
      status = entry.status
      labels = entry.labels || []
      scheduledAt = entry.scheduledAt || ''

      translations = orgLocales.map((loc) => {
        const server = entry.translations?.find((t: any) => t.locale === loc)
        return { locale: loc, title: server?.title ?? '', body: server?.body ?? '' }
      })
      activeLocale = orgLocales[0]
    } catch {
      error = 'Failed to load entry'
    }
  }

  function setActiveLocale(loc: string) {
    activeLocale = loc
  }

  function toggleLabel(label: string) {
    if (labels.includes(label)) {
      labels = labels.filter((l) => l !== label)
    } else {
      labels = [...labels, label]
    }
  }

  function hasLabel(label: string): boolean {
    return labels.includes(label)
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    error = ''

    const filledTranslations = translations.filter((t) => t.title.trim())

    const payload = {
      slug,
      status,
      labels,
      scheduledAt: scheduledAt || null,
      translations: filledTranslations,
    }

    try {
      if (isEdit) {
        await api.put(`/org/${orgId}/changelog/${id}`, payload)
      } else {
        await api.post(`/org/${orgId}/changelog`, payload)
      }
      navigate(`/${orgId}/changelog`)
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to save'
    } finally {
      saving = false
    }
  }

  return {
    get slug() { return slug },
    set slug(v: string) { slug = v },
    get status() { return status },
    set status(v: 'draft' | 'scheduled' | 'published') { status = v },
    get labels() { return labels },
    get scheduledAt() { return scheduledAt },
    set scheduledAt(v: string) { scheduledAt = v },
    get saving() { return saving },
    get error() { return error },
    get isEdit() { return isEdit },
    get orgLocales() { return orgLocales },
    get activeLocale() { return activeLocale },
    get title() {
      return translations.find((t) => t.locale === activeLocale)?.title ?? ''
    },
    set title(v: string) {
      translations = translations.map((t) => t.locale === activeLocale ? { ...t, title: v } : t)
    },
    get body() {
      return translations.find((t) => t.locale === activeLocale)?.body ?? ''
    },
    set body(v: string) {
      translations = translations.map((t) => t.locale === activeLocale ? { ...t, body: v } : t)
    },
    load,
    setActiveLocale,
    toggleLabel,
    hasLabel,
    handleSubmit,
  }
}
