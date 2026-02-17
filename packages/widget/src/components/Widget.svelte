<script lang="ts">
  import FeedbackForm from './FeedbackForm.svelte'
  import PostList from './PostList.svelte'
  import ChatView from './ChatView.svelte'
  import { createWidgetState } from './Widget.svelte.ts'

  let {
    org,
    color = '#6366f1',
    position = 'bottom-right',
    locale = 'en',
    user = null,
  }: {
    org: string
    color?: string
    position?: string
    locale?: string
    user?: any
  } = $props()

  const state = createWidgetState(org)
</script>

<div style={state.positionStyles[position] || state.positionStyles['bottom-right']}>
  {#if state.isOpen}
    <div
      style="
        width: 380px;
        max-height: 520px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: #111827;
      "
    >
      <!-- Header -->
      <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 0;">
          <button
            onclick={() => state.switchTab('feedback')}
            style="
              padding: 6px 14px;
              border: none;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              border-radius: 6px 0 0 6px;
              background: {state.tab === 'feedback' ? color : '#f3f4f6'};
              color: {state.tab === 'feedback' ? 'white' : '#6b7280'};
            "
          >
            Feedback
          </button>
          <button
            onclick={() => state.switchTab('chat')}
            style="
              padding: 6px 14px;
              border: none;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              border-radius: 0 6px 6px 0;
              background: {state.tab === 'chat' ? color : '#f3f4f6'};
              color: {state.tab === 'chat' ? 'white' : '#6b7280'};
            "
          >
            Chat
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          {#if state.tab === 'feedback' && state.view === 'form'}
            <button onclick={state.switchToList} style="background: none; border: none; cursor: pointer; color: #6b7280; font-size: 13px;">
              &larr; Back
            </button>
          {/if}
          <button onclick={state.toggle} style="background: none; border: none; cursor: pointer; color: #6b7280; font-size: 18px;">
            &times;
          </button>
        </div>
      </div>

      <!-- Content -->
      <div style="flex: 1; overflow-y: auto; padding: 16px;">
        {#if state.tab === 'feedback'}
          {#if state.view === 'list'}
            <PostList {org} onNewPost={state.switchToForm} />
          {:else}
            <FeedbackForm {org} boards={state.boards} onSubmitted={state.switchToList} />
          {/if}
        {:else}
          <ChatView {org} {user} />
        {/if}
      </div>
    </div>
  {/if}

  <!-- Trigger button -->
  <button
    onclick={state.toggle}
    style="
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: {color};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    "
    onmouseenter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
    onmouseleave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>
</div>
