import { navigate } from '../lib/router.svelte.ts'
import { api } from '../lib/api/client'
import { currentOrg } from '../lib/stores/org'

interface TranslationDraft {
  locale: string
  title: string
  body: string
}

interface CollectionOption {
  id: string
  name: string
}

export function createArticleEditorState(id?: string) {
  let orgId = $state('')
  let slug = $state('')
  let status = $state<'draft' | 'published' | 'archived'>('draft')
  let collectionId = $state('')
  let collections = $state<CollectionOption[]>([])
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
      // Initialize translation drafts for each org locale
      translations = locales.map((loc) => translations.find((t) => t.locale === loc) ?? { locale: loc, title: '', body: '' })
    }
  })

  async function loadCollections() {
    if (!orgId) return
    try {
      const data = await api.get<{ data: any[] }>(`/org/${orgId}/collections`)
      collections = data.data.map((c: any) => ({
        id: c.id,
        name: c.translations?.[0]?.name ?? c.slug,
      }))
    } catch {
      collections = []
    }
  }

  async function load() {
    loadCollections()
    if (!isEdit || !orgId) return
    try {
      const data = await api.get<{ data: any }>(`/org/${orgId}/articles/${id}`)
      const article = data.data
      slug = article.slug
      status = article.status
      collectionId = article.collectionId || ''

      // Merge server translations into per-locale drafts
      translations = orgLocales.map((loc) => {
        const server = article.translations?.find((t: any) => t.locale === loc)
        return { locale: loc, title: server?.title ?? '', body: server?.body ?? '' }
      })
      activeLocale = orgLocales[0]
    } catch {
      error = 'Failed to load article'
    }
  }

  function setActiveLocale(loc: string) {
    activeLocale = loc
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    error = ''

    // Only send translations that have content
    const filledTranslations = translations.filter((t) => t.title.trim())

    const payload = {
      slug,
      status,
      collectionId: collectionId || null,
      translations: filledTranslations,
    }

    try {
      if (isEdit) {
        await api.put(`/org/${orgId}/articles/${id}`, payload)
      } else {
        await api.post(`/org/${orgId}/articles`, payload)
      }
      navigate(`/${orgId}/articles`)
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to save article'
    } finally {
      saving = false
    }
  }

  return {
    get slug() { return slug },
    set slug(v: string) { slug = v },
    get status() { return status },
    set status(v: 'draft' | 'published' | 'archived') { status = v },
    get collectionId() { return collectionId },
    set collectionId(v: string) { collectionId = v },
    get collections() { return collections },
    get saving() { return saving },
    get error() { return error },
    get isEdit() { return isEdit },
    get orgLocales() { return orgLocales },
    get activeLocale() { return activeLocale },
    // Reactive getters/setters for active locale's fields
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
    handleSubmit,
  }
}
