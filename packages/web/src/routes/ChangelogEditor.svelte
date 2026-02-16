<script lang="ts">
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  let { id }: { id?: string } = $props()

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

  onMount(async () => {
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
  })

  function toggleLabel(label: string) {
    if (labels.includes(label)) {
      labels = labels.filter((l) => l !== label)
    } else {
      labels = [...labels, label]
    }
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

  const allLabels = ['new', 'improvement', 'fix', 'breaking']
</script>

<div class="max-w-4xl">
  <h1 class="text-2xl font-bold text-gray-900">
    {isEdit ? 'Edit Changelog Entry' : 'New Changelog Entry'}
  </h1>

  {#if error}
    <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
  {/if}

  <form onsubmit={handleSubmit} class="mt-8 space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input id="title" type="text" bind:value={title} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
        <input id="slug" type="text" bind:value={slug} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>

    <div>
      <label for="body" class="block text-sm font-medium text-gray-700">Content</label>
      <textarea id="body" bind:value={body} rows={15} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Labels</label>
      <div class="flex gap-2">
        {#each allLabels as label}
          <button
            type="button"
            onclick={() => toggleLabel(label)}
            class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors {labels.includes(label) ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}"
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" bind:value={status} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>
      {#if status === 'scheduled'}
        <div>
          <label for="scheduledAt" class="block text-sm font-medium text-gray-700">Scheduled At</label>
          <input id="scheduledAt" type="datetime-local" bind:value={scheduledAt} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-4">
      <button type="submit" disabled={saving} class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
      </button>
      <a href="/changelog" class="text-sm text-gray-600 hover:text-gray-800">Cancel</a>
    </div>
  </form>
</div>
