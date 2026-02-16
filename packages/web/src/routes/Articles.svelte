<script lang="ts">
  import { onMount } from 'svelte'
  import { link } from 'svelte-routing'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  interface Article {
    id: string
    slug: string
    status: string
    translations: Array<{ locale: string; title: string }>
    collection?: { translations?: Array<{ locale: string; name: string }> }
    createdAt: string
  }

  let articles = $state<Article[]>([])
  let loading = $state(true)
  let orgSlug = $state('')

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(async () => {
    if (!orgSlug) return
    try {
      const data = await api.get<{ data: Article[] }>(`/org/${orgSlug}/articles`)
      articles = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  })

  function getTitle(article: Article): string {
    return article.translations[0]?.title || 'Untitled'
  }

  function statusBadgeClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
</script>

<div>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Articles</h1>
      <p class="mt-1 text-sm text-gray-500">Manage your help center articles.</p>
    </div>
    <a
      href="/articles/new"
      use:link
      class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
    >
      New Article
    </a>
  </div>

  {#if loading}
    <div class="mt-8 text-center text-gray-500">Loading...</div>
  {:else if articles.length === 0}
    <div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
      <p class="text-gray-500">No articles yet. Create your first article to get started.</p>
    </div>
  {:else}
    <div class="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each articles as article}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {getTitle(article)}
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusBadgeClass(article.status)}">
                  {article.status}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {article.collection?.translations?.[0]?.name || '—'}
              </td>
              <td class="px-6 py-4 text-right">
                <a
                  href="/articles/{article.id}/edit"
                  use:link
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Edit
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
