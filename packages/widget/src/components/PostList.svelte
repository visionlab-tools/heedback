<script lang="ts">
  import { onMount } from 'svelte'
  import { widgetApi } from '../api/widget-client'

  let { org, onNewPost }: { org: string; onNewPost: () => void } = $props()

  let posts = $state<any[]>([])
  let loading = $state(true)
  let search = $state('')

  onMount(loadPosts)

  async function loadPosts() {
    loading = true
    try {
      const data = await widgetApi.searchPosts(org, search)
      posts = data.data.slice(0, 20)
    } catch {
      posts = []
    } finally {
      loading = false
    }
  }

  async function handleVote(postId: string) {
    try {
      await widgetApi.vote(org, postId)
      const post = posts.find((p) => p.id === postId)
      if (post) {
        post.voteCount++
        post.hasVoted = true
        posts = [...posts]
      }
    } catch {
      // Already voted or error
    }
  }

  let searchTimeout: ReturnType<typeof setTimeout>
  function handleSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(loadPosts, 300)
  }
</script>

<div>
  <input
    type="search"
    placeholder="Search existing feedback..."
    bind:value={search}
    oninput={handleSearch}
    style="
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    "
  />

  <button
    onclick={onNewPost}
    style="
      width: 100%;
      margin-top: 12px;
      padding: 10px;
      background-color: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    "
  >
    + New Feedback
  </button>

  {#if loading}
    <p style="text-align: center; color: #9ca3af; margin-top: 20px; font-size: 13px;">Loading...</p>
  {:else if posts.length === 0}
    <p style="text-align: center; color: #9ca3af; margin-top: 20px; font-size: 13px;">
      {search ? 'No results found.' : 'No feedback yet. Be the first!'}
    </p>
  {:else}
    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
      {#each posts as post}
        <div
          style="
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          "
        >
          <button
            onclick={() => handleVote(post.id)}
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              min-width: 40px;
              padding: 4px;
              border: 1px solid {post.hasVoted ? '#6366f1' : '#e5e7eb'};
              border-radius: 6px;
              background: {post.hasVoted ? '#eef2ff' : 'white'};
              cursor: pointer;
              font-size: 12px;
            "
          >
            <span style="color: {post.hasVoted ? '#6366f1' : '#9ca3af'};">&#9650;</span>
            <span style="font-weight: 600; color: {post.hasVoted ? '#6366f1' : '#374151'};">{post.voteCount}</span>
          </button>
          <div style="flex: 1; min-width: 0;">
            <p style="font-weight: 500; font-size: 13px; margin: 0; color: #111827;">{post.title}</p>
            <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              {post.body}
            </p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
