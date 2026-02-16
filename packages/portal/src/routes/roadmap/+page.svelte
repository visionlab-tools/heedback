<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const columns = [
    { status: 'planned', label: 'Planned', color: 'purple' },
    { status: 'in_progress', label: 'In Progress', color: 'orange' },
    { status: 'completed', label: 'Completed', color: 'green' },
  ]

  function getPostsForStatus(status: string): any[] {
    const column = data.roadmap.find((c: any) => c.status === status)
    return column?.posts || []
  }
</script>

<svelte:head>
  <title>Roadmap</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900">Roadmap</h1>
  <p class="mt-2 text-gray-600">See what we're working on and what's coming next.</p>

  <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each columns as col}
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wider text-{col.color}-600 mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-{col.color}-500"></span>
          {col.label}
          <span class="text-gray-400 font-normal">({getPostsForStatus(col.status).length})</span>
        </h2>
        <div class="space-y-3">
          {#each getPostsForStatus(col.status) as post}
            <a
              href="/feedback/{post.id}"
              class="block bg-white p-4 rounded-xl border border-gray-200 hover:border-{col.color}-300 transition-colors"
            >
              <h3 class="font-medium text-gray-900 text-sm">{post.title}</h3>
              <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>▲ {post.voteCount}</span>
                {#if post.board}
                  <span>&middot; {post.board.name}</span>
                {/if}
              </div>
            </a>
          {/each}

          {#if getPostsForStatus(col.status).length === 0}
            <div class="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Nothing yet
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
