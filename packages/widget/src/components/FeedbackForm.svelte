<script lang="ts">
  import { widgetApi } from '../api/widget-client'

  let {
    org,
    boards = [],
    onSubmitted,
  }: {
    org: string
    boards: any[]
    onSubmitted: () => void
  } = $props()

  let title = $state('')
  let body = $state('')
  let boardId = $state('')
  let submitting = $state(false)
  let error = $state('')
  let similarPosts = $state<any[]>([])

  // Set default board
  $effect(() => {
    if (boards.length > 0 && !boardId) {
      boardId = boards[0].id
    }
  })

  let debounceTimer: ReturnType<typeof setTimeout>
  function handleTitleInput() {
    clearTimeout(debounceTimer)
    if (title.length >= 3) {
      debounceTimer = setTimeout(async () => {
        try {
          const data = await widgetApi.searchPosts(org, title)
          similarPosts = data.data.slice(0, 3)
        } catch {
          similarPosts = []
        }
      }, 500)
    } else {
      similarPosts = []
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!title.trim() || !boardId) return

    submitting = true
    error = ''

    try {
      await widgetApi.createPost(org, {
        boardId,
        title: title.trim(),
        body: body.trim(),
      })
      title = ''
      body = ''
      similarPosts = []
      onSubmitted()
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to submit'
    } finally {
      submitting = false
    }
  }
</script>

<form onsubmit={handleSubmit}>
  {#if error}
    <div style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px;">
      {error}
    </div>
  {/if}

  {#if boards.length > 1}
    <div style="margin-bottom: 12px;">
      <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Category</label>
      <select
        bind:value={boardId}
        style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; box-sizing: border-box;"
      >
        {#each boards as board}
          <option value={board.id}>{board.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <div style="margin-bottom: 12px;">
    <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Title</label>
    <input
      type="text"
      bind:value={title}
      oninput={handleTitleInput}
      required
      placeholder="Short, descriptive title"
      style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box;"
    />
  </div>

  {#if similarPosts.length > 0}
    <div style="margin-bottom: 12px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
      <p style="font-size: 11px; color: #92400e; font-weight: 600; margin: 0 0 6px;">Similar posts — vote instead?</p>
      {#each similarPosts as post}
        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px;">
          <span style="color: #6b7280;">▲ {post.voteCount}</span>
          <span style="color: #111827;">{post.title}</span>
        </div>
      {/each}
    </div>
  {/if}

  <div style="margin-bottom: 16px;">
    <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Description</label>
    <textarea
      bind:value={body}
      rows={4}
      placeholder="Tell us more about your idea..."
      style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; resize: vertical; outline: none; box-sizing: border-box;"
    ></textarea>
  </div>

  <button
    type="submit"
    disabled={submitting || !title.trim()}
    style="
      width: 100%;
      padding: 10px;
      background-color: {submitting ? '#a5b4fc' : '#6366f1'};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: {submitting ? 'not-allowed' : 'pointer'};
      font-size: 13px;
      font-weight: 600;
    "
  >
    {submitting ? 'Submitting...' : 'Submit Feedback'}
  </button>
</form>
