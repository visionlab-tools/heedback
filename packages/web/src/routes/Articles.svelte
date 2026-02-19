<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Badge, PageHeader, EmptyState, DataTable, LoadingSpinner } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'

  interface Article {
    id: string
    slug: string
    status: string
    translations: Array<{ locale: string; title: string }>
    tags?: Array<{ id: string; name: string; color: string | null }>
    createdAt: string
  }

  let { orgId }: { orgId: string } = $props()

  let articles = $state<Article[]>([])
  let loading = $state(true)

  onMount(async () => {
    if (!orgId) return
    try {
      const data = await api.get<{ data: Article[] }>(`/org/${orgId}/articles`)
      articles = data.data
    } finally {
      loading = false
    }
  })

  function getTitle(article: Article): string {
    return article.translations[0]?.title || $_('common.untitled')
  }

  type BadgeVariant = 'success' | 'warning' | 'neutral'

  function statusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      published: 'success',
      draft: 'warning',
    }
    return map[status] || 'neutral'
  }

  // Reactive so column headers update when locale changes
  let columns = $derived([
    { label: $_('articles.col_title') },
    { label: $_('articles.col_status') },
    { label: $_('article_editor.tags') },
    { label: $_('common.actions'), align: 'right' as const },
  ])
</script>

<div>
  <PageHeader title={$_('articles.title')} subtitle={$_('articles.subtitle')}>
    {#snippet actions()}
      <Button href="/{orgId}/articles/new" size="sm">{$_('articles.new')}</Button>
    {/snippet}
  </PageHeader>

  {#if loading}
    <LoadingSpinner />
  {:else if articles.length === 0}
    <EmptyState message={$_('articles.empty')} />
  {:else}
    <DataTable {columns}>
      {#each articles as article}
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-4 text-sm font-medium text-slate-900">{getTitle(article)}</td>
          <td class="px-6 py-4">
            <Badge variant={statusVariant(article.status)}>{article.status}</Badge>
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {#if article.tags?.length}
              <div class="flex flex-wrap gap-1">
                {#each article.tags as tag}
                  <span
                    class="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                    style:background={tag.color ?? '#6b7280'}
                  >{tag.name}</span>
                {/each}
              </div>
            {:else}
              —
            {/if}
          </td>
          <td class="px-6 py-4 text-right">
            <Button href="/{orgId}/articles/{article.id}/edit" variant="ghost" size="sm">{$_('common.edit')}</Button>
          </td>
        </tr>
      {/each}
    </DataTable>
  {/if}
</div>
