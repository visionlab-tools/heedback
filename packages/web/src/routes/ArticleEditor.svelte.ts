import { navigate } from '../lib/router.svelte.ts'
import { api } from '../lib/api/client'
import { currentOrg } from '../lib/stores/org'

export function createArticleEditorState(id?: string) {
  let orgSlug = $state('')
  let title = $state('')
  let body = $state('')
  let slug = $state('')
  let status = $state<'draft' | 'published' | 'archived'>('draft')
  let locale = $state('en')
  let collectionId = $state('')
  let seoTitle = $state('')
  let seoDescription = $state('')
  let saving = $state(false)
  let error = $state('')

  let isEdit = $derived(!!id)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  async function load() {
    if (isEdit && orgSlug) {
      try {
        const data = await api.get<{ data: any }>(`/org/${orgSlug}/articles/${id}`)
        const article = data.data
        slug = article.slug
        status = article.status
        seoTitle = article.seoTitle || ''
        seoDescription = article.seoDescription || ''
        collectionId = article.collectionId || ''
        if (article.translations?.[0]) {
          title = article.translations[0].title
          body = article.translations[0].body
          locale = article.translations[0].locale
        }
      } catch {
        error = 'Failed to load article'
      }
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    error = ''

    const payload = {
      slug,
      status,
      collectionId: collectionId || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      translations: [{ locale, title, body }],
    }

    try {
      if (isEdit) {
        await api.patch(`/org/${orgSlug}/articles/${id}`, payload)
      } else {
        await api.post(`/org/${orgSlug}/articles`, payload)
      }
      navigate('/articles')
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to save article'
    } finally {
      saving = false
    }
  }

  return {
    get title() { return title },
    set title(v: string) { title = v },
    get body() { return body },
    set body(v: string) { body = v },
    get slug() { return slug },
    set slug(v: string) { slug = v },
    get status() { return status },
    set status(v: 'draft' | 'published' | 'archived') { status = v },
    get locale() { return locale },
    set locale(v: string) { locale = v },
    get collectionId() { return collectionId },
    set collectionId(v: string) { collectionId = v },
    get seoTitle() { return seoTitle },
    set seoTitle(v: string) { seoTitle = v },
    get seoDescription() { return seoDescription },
    set seoDescription(v: string) { seoDescription = v },
    get saving() { return saving },
    get error() { return error },
    get isEdit() { return isEdit },
    load,
    handleSubmit,
  }
}
