<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  let { id }: { id: string } = $props()

  let orgSlug = $state('')
  let post = $state<any>(null)
  let comments = $state<any[]>([])
  let loading = $state(true)
  let newComment = $state('')
  let isInternal = $state(false)
  let newStatus = $state('')

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(async () => {
    if (!orgSlug || !id) return
    try {
      const [postData, commentsData] = await Promise.all([
        api.get<{ data: any }>(`/org/${orgSlug}/posts/${id}`),
        api.get<{ data: any[] }>(`/org/${orgSlug}/posts/${id}/comments`),
      ])
      post = postData.data
      comments = commentsData.data
      newStatus = post.status
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  })

  async function handleStatusChange() {
    if (!post || newStatus === post.status) return
    await api.patch(`/org/${orgSlug}/posts/${id}`, { status: newStatus })
    post.status = newStatus
  }

  async function handleAddComment(e: Event) {
    e.preventDefault()
    if (!newComment.trim()) return
    const data = await api.post<{ data: any }>(`/org/${orgSlug}/posts/${id}/comments`, {
      body: newComment,
      isInternal,
    })
    comments = [...comments, data.data]
    newComment = ''
    isInternal = false
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    await api.delete(`/org/${orgSlug}/posts/${id}`)
    window.history.back()
  }
</script>

<div class="max-w-4xl">
  {#if loading}
    <div class="text-center text-gray-500">Loading...</div>
  {:else if post}
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{post.title}</h1>
        <p class="mt-1 text-sm text-gray-500">
          by {post.author?.name || 'Anonymous'} · {post.voteCount} votes
        </p>
      </div>
      <button onclick={handleDelete} class="text-sm text-red-600 hover:text-red-800">Delete</button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <select bind:value={newStatus} onchange={handleStatusChange} class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="open">Open</option>
        <option value="under_review">Under Review</option>
        <option value="planned">Planned</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="closed">Closed</option>
      </select>
    </div>

    <div class="mt-6 bg-white p-6 rounded-xl border border-gray-200">
      <p class="text-gray-800 whitespace-pre-wrap">{post.body}</p>
    </div>

    {#if post.tags?.length}
      <div class="mt-4 flex gap-2">
        {#each post.tags as tag}
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style="background-color: {tag.color}20; color: {tag.color}">
            {tag.name}
          </span>
        {/each}
      </div>
    {/if}

    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-900">Comments ({comments.length})</h2>

      <div class="mt-4 space-y-4">
        {#each comments as comment}
          <div class="bg-white p-4 rounded-xl border {comment.isInternal ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="font-medium text-gray-900">{comment.author?.name || 'Anonymous'}</span>
              {#if comment.isInternal}
                <span class="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">Internal</span>
              {/if}
            </div>
            <p class="mt-1 text-gray-800">{comment.body}</p>
          </div>
        {/each}
      </div>

      <form onsubmit={handleAddComment} class="mt-6">
        <textarea
          bind:value={newComment}
          rows={3}
          placeholder="Add a comment..."
          class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        ></textarea>
        <div class="mt-3 flex items-center gap-4">
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            Add Comment
          </button>
          <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={isInternal} class="rounded border-gray-300" />
            <span class="text-sm text-gray-600">Internal note</span>
          </label>
        </div>
      </form>
    </div>
  {/if}
</div>
