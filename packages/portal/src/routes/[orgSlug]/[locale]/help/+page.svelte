<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{$_('help.title')}</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900">{$_('help.title')}</h1>
  <p class="mt-2 text-gray-600">{$_('help.subtitle')}</p>

  <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.collections as collection}
      <a
        href="/{$page.params.locale}/help/{collection.slug}"
        class="block bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">{collection.icon || ''}</span>
          <div>
            <h2 class="font-semibold text-gray-900">
              {collection.translations?.[0]?.name || $_('help.untitled')}
            </h2>
            {#if collection.translations?.[0]?.description}
              <p class="mt-1 text-sm text-gray-500">{collection.translations[0].description}</p>
            {/if}
            <p class="mt-1 text-xs text-gray-400">{$_('help.articles_count', { values: { count: collection.articleCount || 0 } })}</p>
          </div>
        </div>
      </a>
    {/each}
  </div>

  {#if data.collections.length === 0}
    <div class="mt-8 text-center py-12 text-gray-400">
      {$_('help.no_collections')}
    </div>
  {/if}
</div>
