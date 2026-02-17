<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  // Each column maps a status to its i18n key and Tailwind color
  const columns = [
    { status: 'planned', labelKey: 'roadmap.planned', color: 'purple' },
    { status: 'in_progress', labelKey: 'roadmap.in_progress', color: 'orange' },
    { status: 'completed', labelKey: 'roadmap.completed', color: 'green' },
  ]

  function getPostsForStatus(status: string): any[] {
    const column = data.roadmap.find((c: any) => c.status === status)
    return column?.posts || []
  }
</script>

<svelte:head>
  <title>{$_('roadmap.title')}</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900">{$_('roadmap.title')}</h1>
  <p class="mt-2 text-gray-600">{$_('roadmap.subtitle')}</p>

  <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each columns as col}
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wider text-{col.color}-600 mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-{col.color}-500"></span>
          {$_(col.labelKey)}
          <span class="text-gray-400 font-normal">({getPostsForStatus(col.status).length})</span>
        </h2>
        <div class="space-y-3">
          {#each getPostsForStatus(col.status) as post}
            <a
              href="/{$page.params.locale}/feedback/{post.id}"
              class="block bg-white p-4 rounded-xl border border-gray-200 hover:border-{col.color}-300 transition-colors"
            >
              <h3 class="font-medium text-gray-900 text-sm">{post.title}</h3>
              <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>{post.voteCount}</span>
                {#if post.board}
                  <span>&middot; {post.board.name}</span>
                {/if}
              </div>
            </a>
          {/each}

          {#if getPostsForStatus(col.status).length === 0}
            <div class="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              {$_('roadmap.nothing_yet')}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
