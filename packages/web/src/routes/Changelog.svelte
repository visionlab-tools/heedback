<script lang="ts">
  import { onMount } from 'svelte'
  import { link } from 'svelte-routing'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  interface ChangelogEntry {
    id: string
    slug: string
    status: string
    labels: string[]
    publishedAt: string | null
    translations: Array<{ locale: string; title: string }>
  }

  let entries = $state<ChangelogEntry[]>([])
  let loading = $state(true)
  let orgSlug = $state('')

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(async () => {
    if (!orgSlug) return
    try {
      const data = await api.get<{ data: ChangelogEntry[] }>(`/org/${orgSlug}/changelog`)
      entries = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  })

  function labelBadgeClass(label: string): string {
    const map: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      improvement: 'bg-blue-100 text-blue-800',
      fix: 'bg-orange-100 text-orange-800',
      breaking: 'bg-red-100 text-red-800',
    }
    return map[label] || 'bg-gray-100 text-gray-800'
  }
</script>

<div>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Changelog</h1>
      <p class="mt-1 text-sm text-gray-500">Manage your changelog entries.</p>
    </div>
    <a href="/changelog/new" use:link class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
      New Entry
    </a>
  </div>

  {#if loading}
    <div class="mt-8 text-center text-gray-500">Loading...</div>
  {:else if entries.length === 0}
    <div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
      <p class="text-gray-500">No changelog entries yet.</p>
    </div>
  {:else}
    <div class="mt-8 space-y-3">
      {#each entries as entry}
        <a href="/changelog/{entry.id}/edit" use:link class="block bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                {#each entry.labels as label}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {labelBadgeClass(label)}">
                    {label}
                  </span>
                {/each}
                <span class="text-xs text-gray-400">{entry.status}</span>
              </div>
              <h3 class="mt-1 font-medium text-gray-900">{entry.translations[0]?.title || 'Untitled'}</h3>
            </div>
            {#if entry.publishedAt}
              <span class="text-xs text-gray-500">{new Date(entry.publishedAt).toLocaleDateString()}</span>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
