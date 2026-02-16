<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Help Center - {data.collectionSlug}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/help" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to Help Center</a>

  <h1 class="mt-4 text-3xl font-bold text-gray-900 capitalize">{data.collectionSlug.replace(/-/g, ' ')}</h1>

  <div class="mt-8 space-y-4">
    {#each data.articles as article}
      <a
        href="/help/{data.collectionSlug}/{article.slug}"
        class="block bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
      >
        <h2 class="font-medium text-gray-900">{article.translations?.[0]?.title || 'Untitled'}</h2>
      </a>
    {/each}
  </div>

  {#if data.articles.length === 0}
    <div class="mt-8 text-center py-12 text-gray-400">
      No articles in this collection yet.
    </div>
  {/if}
</div>
