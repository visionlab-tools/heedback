<script lang="ts">
  import { onMount } from 'svelte'
  import { setApiBase, widgetApi } from '../api/widget-client'
  import FeedbackForm from './FeedbackForm.svelte'
  import PostList from './PostList.svelte'
  import ChatView from './ChatView.svelte'

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

  let isOpen = $state(false)
  let tab = $state<'feedback' | 'chat'>('feedback')
  let view = $state<'list' | 'form'>('list')
  let boards = $state<any[]>([])

  const positionStyles: Record<string, string> = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
  }

  onMount(() => {
    // Resolve API base from the script source
    const scripts = document.querySelectorAll('script[data-org]')
    const script = scripts[scripts.length - 1] as HTMLScriptElement | undefined
    if (script?.src) {
      const url = new URL(script.src)
      setApiBase(url.origin)
    } else {
      setApiBase(window.location.origin)
    }

    // Load boards
    widgetApi.getBoards(org).then((data) => {
      boards = data.data
    }).catch(() => {})
  })

  function toggle() {
    isOpen = !isOpen
  }

  function switchToForm() {
    view = 'form'
  }

  function switchToList() {
    view = 'list'
  }
</script>

<div style={positionStyles[position] || positionStyles['bottom-right']}>
  {#if isOpen}
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
            onclick={() => { tab = 'feedback'; view = 'list' }}
            style="
              padding: 6px 14px;
              border: none;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              border-radius: 6px 0 0 6px;
              background: {tab === 'feedback' ? color : '#f3f4f6'};
              color: {tab === 'feedback' ? 'white' : '#6b7280'};
            "
          >
            Feedback
          </button>
          <button
            onclick={() => { tab = 'chat' }}
            style="
              padding: 6px 14px;
              border: none;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              border-radius: 0 6px 6px 0;
              background: {tab === 'chat' ? color : '#f3f4f6'};
              color: {tab === 'chat' ? 'white' : '#6b7280'};
            "
          >
            Chat
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          {#if tab === 'feedback' && view === 'form'}
            <button onclick={switchToList} style="background: none; border: none; cursor: pointer; color: #6b7280; font-size: 13px;">
              &larr; Back
            </button>
          {/if}
          <button onclick={toggle} style="background: none; border: none; cursor: pointer; color: #6b7280; font-size: 18px;">
            &times;
          </button>
        </div>
      </div>

      <!-- Content -->
      <div style="flex: 1; overflow-y: auto; padding: 16px;">
        {#if tab === 'feedback'}
          {#if view === 'list'}
            <PostList {org} onNewPost={switchToForm} />
          {:else}
            <FeedbackForm {org} {boards} onSubmitted={switchToList} />
          {/if}
        {:else}
          <ChatView {org} {user} />
        {/if}
      </div>
    </div>
  {/if}

  <!-- Trigger button -->
  <button
    onclick={toggle}
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
