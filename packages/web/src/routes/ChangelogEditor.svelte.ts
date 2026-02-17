import { navigate } from 'svelte-routing'
import { api } from '../lib/api/client'
import { currentOrg } from '../lib/stores/org'

export const allLabels = ['new', 'improvement', 'fix', 'breaking']

export function createChangelogEditorState(id?: string) {
  let orgSlug = $state('')
  let title = $state('')
  let body = $state('')
  let slug = $state('')
  let status = $state<'draft' | 'scheduled' | 'published'>('draft')
  let locale = $state('en')
  let labels = $state<string[]>([])
  let scheduledAt = $state('')
  let saving = $state(false)
  let error = $state('')

  let isEdit = $derived(!!id)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  async function load() {
    if (isEdit && orgSlug) {
      try {
        const data = await api.get<{ data: any }>(`/org/${orgSlug}/changelog/${id}`)
        const entry = data.data
        slug = entry.slug
        status = entry.status
        labels = entry.labels || []
        scheduledAt = entry.scheduledAt || ''
        if (entry.translations?.[0]) {
          title = entry.translations[0].title
          body = entry.translations[0].body
          locale = entry.translations[0].locale
        }
      } catch {
        error = 'Failed to load entry'
      }
    }
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

    const payload = {
      slug,
      status,
      labels,
      scheduledAt: scheduledAt || null,
      translations: [{ locale, title, body }],
    }

    try {
      if (isEdit) {
        await api.patch(`/org/${orgSlug}/changelog/${id}`, payload)
      } else {
        await api.post(`/org/${orgSlug}/changelog`, payload)
      }
      navigate('/changelog')
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to save'
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
    set status(v: 'draft' | 'scheduled' | 'published') { status = v },
    get locale() { return locale },
    set locale(v: string) { locale = v },
    get labels() { return labels },
    get scheduledAt() { return scheduledAt },
    set scheduledAt(v: string) { scheduledAt = v },
    get saving() { return saving },
    get error() { return error },
    get isEdit() { return isEdit },
    load,
    toggleLabel,
    hasLabel,
    handleSubmit,
  }
}
