<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

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

<svelte:head>
  <title>{$_('changelog.title')}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{$_('changelog.title')}</h1>
      <p class="mt-2 text-gray-600">{$_('changelog.subtitle')}</p>
    </div>
  </div>

  <div class="mt-10 space-y-12">
    {#each data.entries as entry}
      <article class="relative pl-8 border-l-2 border-gray-200">
        <div class="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500"></div>

        {#if entry.publishedAt}
          <time class="text-sm text-gray-400">{new Date(entry.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        {/if}

        <div class="mt-1 flex items-center gap-2">
          {#each entry.labels || [] as label}
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {labelBadgeClass(label)}">
              {label}
            </span>
          {/each}
        </div>

        <a href="/{$page.params.locale}/changelog/{entry.slug}" class="block mt-2">
          <h2 class="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
            {entry.translations?.[0]?.title || $_('changelog.untitled')}
          </h2>
        </a>
      </article>
    {/each}
  </div>

  {#if data.entries.length === 0}
    <div class="mt-8 text-center py-12 text-gray-400">
      {$_('changelog.empty')}
    </div>
  {/if}
</div>
