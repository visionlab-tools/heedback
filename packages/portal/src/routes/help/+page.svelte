<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Help Center</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900">Help Center</h1>
  <p class="mt-2 text-gray-600">Browse our knowledge base to find answers.</p>

  <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.collections as collection}
      <a
        href="/help/{collection.slug}"
        class="block bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">{collection.icon || '📁'}</span>
          <div>
            <h2 class="font-semibold text-gray-900">
              {collection.translations?.[0]?.name || 'Untitled'}
            </h2>
            {#if collection.translations?.[0]?.description}
              <p class="mt-1 text-sm text-gray-500">{collection.translations[0].description}</p>
            {/if}
            <p class="mt-1 text-xs text-gray-400">{collection.articleCount || 0} articles</p>
          </div>
        </div>
      </a>
    {/each}
  </div>

  {#if data.collections.length === 0}
    <div class="mt-8 text-center py-12 text-gray-400">
      No collections yet.
    </div>
  {/if}
</div>
