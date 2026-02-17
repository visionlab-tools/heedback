<script lang="ts">
  import { createFeedbackFormState } from './FeedbackForm.svelte.ts'

  let {
    org,
    boards = [],
    onSubmitted,
  }: {
    org: string
    boards: any[]
    onSubmitted: () => void
  } = $props()

  const state = createFeedbackFormState(org, boards, onSubmitted)
</script>

<form onsubmit={state.handleSubmit}>
  {#if state.error}
    <div style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px;">
      {state.error}
    </div>
  {/if}

  {#if boards.length > 1}
    <div style="margin-bottom: 12px;">
      <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Category</label>
      <select
        bind:value={state.boardId}
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
      bind:value={state.title}
      oninput={state.handleTitleInput}
      required
      placeholder="Short, descriptive title"
      style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box;"
    />
  </div>

  {#if state.similarPosts.length > 0}
    <div style="margin-bottom: 12px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
      <p style="font-size: 11px; color: #92400e; font-weight: 600; margin: 0 0 6px;">Similar posts — vote instead?</p>
      {#each state.similarPosts as post}
        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px;">
          <span style="color: #6b7280;">&#9650; {post.voteCount}</span>
          <span style="color: #111827;">{post.title}</span>
        </div>
      {/each}
    </div>
  {/if}

  <div style="margin-bottom: 16px;">
    <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Description</label>
    <textarea
      bind:value={state.body}
      rows={4}
      placeholder="Tell us more about your idea..."
      style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; resize: vertical; outline: none; box-sizing: border-box;"
    ></textarea>
  </div>

  <button
    type="submit"
    disabled={state.submitting || !state.title.trim()}
    style="
      width: 100%;
      padding: 10px;
      background-color: {state.submitting ? '#a5b4fc' : '#6366f1'};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: {state.submitting ? 'not-allowed' : 'pointer'};
      font-size: 13px;
      font-weight: 600;
    "
  >
    {state.submitting ? 'Submitting...' : 'Submit Feedback'}
  </button>
</form>
