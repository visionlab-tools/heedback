<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let articles = $state([...data.articles])
  let lastPage = $state(data.meta?.lastPage ?? 1)
  let currentPage = $state(1)
  let hasMore = $derived(currentPage < lastPage)
  let loading = $state(false)
  let sentinel: HTMLDivElement | undefined = $state()

  async function loadMore() {
    if (loading || !hasMore) return
    loading = true

    const nextPage = currentPage + 1
    const res = await fetch(
      `/${$page.params.orgSlug}/api/articles?collection=${data.collectionSlug}&locale=${data.locale}&page=${nextPage}`,
    )
    const json = await res.json()

    articles = [...articles, ...json.data]
    currentPage = nextPage
    if (json.meta) lastPage = json.meta.lastPage
    loading = false
  }

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
</script>

<svelte:head>
  <title>{$_('help.title')} - {data.collectionSlug}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/{$page.params.orgSlug}/{$page.params.locale}/help" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; {$_('help.back')}</a>

  <h1 class="mt-4 text-3xl font-bold text-gray-900 capitalize">{data.collectionSlug.replace(/-/g, ' ')}</h1>

  <div class="mt-8 space-y-4">
    {#each articles as article}
      <a
        href="/{$page.params.orgSlug}/{$page.params.locale}/help/{data.collectionSlug}/{article.slug}"
        class="block bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
      >
        <h2 class="font-medium text-gray-900">{article.title || $_('help.untitled')}</h2>
      </a>
    {/each}
  </div>

  {#if articles.length === 0 && !loading}
    <div class="mt-8 text-center py-12 text-gray-400">
      {$_('help.no_articles')}
    </div>
  {/if}

  {#if loading}
    <div class="mt-4 text-center py-4 text-gray-400">
      {$_('help.loading')}
    </div>
  {/if}

  {#if hasMore}
    <div bind:this={sentinel} class="h-1"></div>
  {/if}
</div>
