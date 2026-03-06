<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{$_('help.title')} - {data.collectionSlug}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/{$page.params.locale}/help" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; {$_('help.back')}</a>

  <h1 class="mt-4 text-3xl font-bold text-gray-900 capitalize">{data.collectionSlug.replace(/-/g, ' ')}</h1>

  <div class="mt-8 space-y-4">
    {#each data.articles as article}
      <a
        href="/{$page.params.locale}/help/{data.collectionSlug}/{article.slug}"
        class="block bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
      >
        <h2 class="font-medium text-gray-900">{article.translations?.[0]?.title || $_('help.untitled')}</h2>
      </a>
    {/each}
  </div>

  {#if data.articles.length === 0}
    <div class="mt-8 text-center py-12 text-gray-400">
      {$_('help.no_articles')}
    </div>
  {/if}
</div>
