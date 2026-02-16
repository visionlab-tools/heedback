<script lang="ts">
  import { onMount } from 'svelte'
  import { link } from 'svelte-routing'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  interface Post {
    id: string
    title: string
    status: string
    voteCount: number
    board?: { name: string }
    author?: { name: string | null }
    createdAt: string
  }

  let posts = $state<Post[]>([])
  let loading = $state(true)
  let orgSlug = $state('')
  let statusFilter = $state('')
  let sortBy = $state<'votes' | 'newest'>('newest')

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(loadPosts)

  async function loadPosts() {
    if (!orgSlug) return
    loading = true
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('sort', sortBy)
      const data = await api.get<{ data: Post[] }>(`/org/${orgSlug}/posts?${params}`)
      posts = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

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

<div>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Feedback Posts</h1>
      <p class="mt-1 text-sm text-gray-500">Manage feedback from your users.</p>
    </div>
  </div>

  <div class="mt-6 flex gap-4">
    <select bind:value={statusFilter} onchange={loadPosts} class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
      <option value="">All statuses</option>
      <option value="open">Open</option>
      <option value="under_review">Under Review</option>
      <option value="planned">Planned</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="closed">Closed</option>
    </select>
    <select bind:value={sortBy} onchange={loadPosts} class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
      <option value="newest">Newest</option>
      <option value="votes">Most Votes</option>
    </select>
  </div>

  {#if loading}
    <div class="mt-8 text-center text-gray-500">Loading...</div>
  {:else if posts.length === 0}
    <div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
      <p class="text-gray-500">No posts found.</p>
    </div>
  {:else}
    <div class="mt-6 space-y-3">
      {#each posts as post}
        <a href="/posts/{post.id}" use:link class="block bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusBadgeClass(post.status)}">
                  {post.status.replace('_', ' ')}
                </span>
                {#if post.board}
                  <span class="text-xs text-gray-500">{post.board.name}</span>
                {/if}
              </div>
              <h3 class="mt-1 font-medium text-gray-900">{post.title}</h3>
              <p class="mt-1 text-xs text-gray-500">
                by {post.author?.name || 'Anonymous'}
              </p>
            </div>
            <div class="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              <span>▲</span>
              <span>{post.voteCount}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
