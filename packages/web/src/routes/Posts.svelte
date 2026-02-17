<script lang="ts">
  import { onMount } from 'svelte'
  import { ChevronUp } from 'lucide-svelte'
  import { Badge, Card, Select, PageHeader, EmptyState, LoadingSpinner } from '@heedback/ui-kit'
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

  type BadgeVariant = 'info' | 'warning' | 'purple' | 'orange' | 'success' | 'neutral'

  function statusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      open: 'info',
      under_review: 'warning',
      planned: 'purple',
      in_progress: 'orange',
      completed: 'success',
    }
    return map[status] || 'neutral'
  }
</script>

<div>
  <PageHeader title="Feedback Posts" subtitle="Manage feedback from your users." />

  <div class="mt-6 flex gap-4">
    <Select bind:value={statusFilter} onchange={loadPosts}>
      <option value="">All statuses</option>
      <option value="open">Open</option>
      <option value="under_review">Under Review</option>
      <option value="planned">Planned</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="closed">Closed</option>
    </Select>
    <Select bind:value={sortBy} onchange={loadPosts}>
      <option value="newest">Newest</option>
      <option value="votes">Most Votes</option>
    </Select>
  </div>

  {#if loading}
    <LoadingSpinner />
  {:else if posts.length === 0}
    <EmptyState message="No posts found." />
  {:else}
    <div class="mt-6 space-y-3">
      {#each posts as post}
        <Card href="/posts/{post.id}" padding="sm" interactive>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <Badge variant={statusVariant(post.status)}>{post.status.replace('_', ' ')}</Badge>
                {#if post.board}
                  <span class="text-xs text-gray-500">{post.board.name}</span>
                {/if}
              </div>
              <h3 class="mt-1 font-medium text-gray-900">{post.title}</h3>
              <p class="mt-1 text-xs text-gray-500">by {post.author?.name || 'Anonymous'}</p>
            </div>
            <div class="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              <ChevronUp size={16} />
              <span>{post.voteCount}</span>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
