<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  function statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      planned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }
</script>

<svelte:head>
  <title>Feedback</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Feedback</h1>
      <p class="mt-2 text-gray-600">Share your ideas and vote on features.</p>
    </div>
  </div>

  {#if data.boards.length > 0}
    <div class="mt-6 flex gap-2 flex-wrap">
      <a
        href="/feedback"
        class="px-3 py-1.5 text-sm rounded-full border {!data.filters.board ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-gray-600 border-gray-300'}"
      >
        All
      </a>
      {#each data.boards as board}
        <a
          href="/feedback?board={board.slug}"
          class="px-3 py-1.5 text-sm rounded-full border {data.filters.board === board.slug ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-gray-600 border-gray-300'}"
        >
          {board.name}
        </a>
      {/each}
    </div>
  {/if}

  <div class="mt-8 space-y-3">
    {#each data.posts as post}
      <a
        href="/feedback/{post.id}"
        class="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
      >
        <div class="flex flex-col items-center min-w-[48px]">
          <button class="text-gray-400 hover:text-indigo-600">&#9650;</button>
          <span class="text-sm font-bold text-gray-900">{post.voteCount}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {statusBadgeClass(post.status)}">
              {post.status.replace('_', ' ')}
            </span>
          </div>
          <h3 class="mt-1 font-medium text-gray-900">{post.title}</h3>
          <p class="mt-1 text-sm text-gray-500 line-clamp-2">{post.body}</p>
        </div>
      </a>
    {/each}
  </div>

  {#if data.posts.length === 0}
    <div class="mt-8 text-center py-12 text-gray-400">
      No feedback posts yet. Be the first to share your ideas!
    </div>
  {/if}
</div>
