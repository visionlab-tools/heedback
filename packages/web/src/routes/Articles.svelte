<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Badge, PageHeader, EmptyState, DataTable, LoadingSpinner } from '@heedback/ui-kit'
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

  type BadgeVariant = 'success' | 'warning' | 'neutral'

  function statusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      published: 'success',
      draft: 'warning',
    }
    return map[status] || 'neutral'
  }
</script>

<div>
  <PageHeader title="Articles" subtitle="Manage your help center articles.">
    {#snippet actions()}
      <Button href="/articles/new" size="sm">New Article</Button>
    {/snippet}
  </PageHeader>

  {#if loading}
    <LoadingSpinner />
  {:else if articles.length === 0}
    <EmptyState message="No articles yet. Create your first article to get started." />
  {:else}
    <div class="mt-8">
      <DataTable columns={[
        { label: 'Title' },
        { label: 'Status' },
        { label: 'Collection' },
        { label: 'Actions', align: 'right' },
      ]}>
        {#each articles as article}
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{getTitle(article)}</td>
            <td class="px-6 py-4">
              <Badge variant={statusVariant(article.status)}>{article.status}</Badge>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {article.collection?.translations?.[0]?.name || '—'}
            </td>
            <td class="px-6 py-4 text-right">
              <Button href="/articles/{article.id}/edit" variant="ghost" size="sm">Edit</Button>
            </td>
          </tr>
        {/each}
      </DataTable>
    </div>
  {/if}
</div>
