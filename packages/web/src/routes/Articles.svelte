<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Badge, PageHeader, EmptyState, DataTable, LoadingSpinner } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import ArticleImportModal from '../lib/components/ArticleImportModal.svelte'

  interface Article {
    id: string
    slug: string
    status: string
    embedded: boolean
    translations: Array<{ locale: string; title: string }>
    tags?: Array<{ id: string; name: string; color: string | null }>
    createdAt: string
  }

  interface PaginationMeta {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }

  let { orgId }: { orgId: string } = $props()

  let articles = $state<Article[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let showImportModal = $state(false)
  let embeddingIds = $state(new Set<string>())
  let currentPage = $state(1)
  let lastPage = $state(1)
  let hasMore = $derived(currentPage < lastPage)
  let sentinel: HTMLDivElement | undefined = $state()

  async function fetchArticles() {
    if (!orgId) return
    loading = true
    try {
      const data = await api.get<{ data: Article[]; meta: PaginationMeta }>(`/org/${orgId}/articles?page=1&limit=20`)
      articles = data.data
      lastPage = data.meta.lastPage
      currentPage = 1
    } finally {
      loading = false
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return
    loadingMore = true
    try {
      const nextPage = currentPage + 1
      const data = await api.get<{ data: Article[]; meta: PaginationMeta }>(
        `/org/${orgId}/articles?page=${nextPage}&limit=20`,
      )
      articles = [...articles, ...data.data]
      currentPage = nextPage
      lastPage = data.meta.lastPage
    } finally {
      loadingMore = false
    }
  }

  onMount(fetchArticles)

  $effect(() => {
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
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

  async function embedArticle(articleId: string) {
    embeddingIds = new Set([...embeddingIds, articleId])
    try {
      await api.post(`/org/${orgId}/articles/${articleId}/embed`)
      articles = articles.map((a) =>
        a.id === articleId ? { ...a, embedded: true } : a,
      )
    } catch {
      alert($_('articles.embed_error'))
    } finally {
      embeddingIds = new Set([...embeddingIds].filter((id) => id !== articleId))
    }
  }

  let columns = $derived([
    { label: $_('articles.col_title') },
    { label: $_('articles.col_status') },
    { label: $_('articles.col_embedding') },
    { label: $_('article_editor.tags') },
    { label: $_('common.actions'), align: 'right' as const },
  ])
</script>

<div>
  <PageHeader title={$_('articles.title')} subtitle={$_('articles.subtitle')}>
    {#snippet actions()}
      <Button variant="ghost" size="sm" onclick={() => showImportModal = true}>
        {$_('articles.import')}
      </Button>
      <Button href="/{orgId}/articles/new" size="sm">{$_('articles.new')}</Button>
    {/snippet}
  </PageHeader>

  <ArticleImportModal {orgId} bind:open={showImportModal} onimported={fetchArticles} />

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
          <td class="px-6 py-4">
            {#if article.embedded}
              <Badge variant="success">{$_('articles.embedded')}</Badge>
            {:else}
              <div class="flex items-center gap-2">
                <Badge variant="neutral">{$_('articles.not_embedded')}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={embeddingIds.has(article.id)}
                  onclick={() => embedArticle(article.id)}
                >
                  {embeddingIds.has(article.id) ? $_('articles.embedding_in_progress') : $_('articles.embed_action')}
                </Button>
              </div>
            {/if}
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

    {#if loadingMore}
      <div class="py-4 text-center">
        <LoadingSpinner />
      </div>
    {/if}

    {#if hasMore}
      <div bind:this={sentinel} class="h-1"></div>
    {/if}
  {/if}
</div>
