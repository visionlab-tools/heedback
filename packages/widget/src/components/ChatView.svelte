<script lang="ts">
  import { renderMarkdown } from '../utils/markdown'
  import { createChatViewState } from './ChatView.svelte.ts'

  let {
    org,
    user = null,
  }: {
    org: string
    user?: any
  } = $props()

  const state = createChatViewState(org, user)
</script>

<div style="display: flex; flex-direction: column; height: 100%;">
  {#if !state.started}
    <!-- New conversation form -->
    <form onsubmit={state.handleStart} style="display: flex; flex-direction: column; gap: 10px;">
      <input
        type="text"
        placeholder="Subject (optional)"
        bind:value={state.subject}
        style="
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        "
      />
      <textarea
        placeholder="How can we help?"
        bind:value={state.newMessage}
        rows={4}
        style="
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          resize: none;
          font-family: inherit;
        "
      ></textarea>
      <button
        type="submit"
        disabled={state.sending || !state.newMessage.trim()}
        style="
          padding: 10px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          opacity: {state.sending || !state.newMessage.trim() ? '0.5' : '1'};
        "
      >
        {state.sending ? 'Sending...' : 'Start Conversation'}
      </button>
    </form>
  {:else}
    <!-- Conversation thread -->
    <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
      {#each state.messages as msg}
        <div
          style="
            padding: 8px 12px;
            border-radius: 12px;
            max-width: 85%;
            font-size: 13px;
            line-height: 1.4;
            {msg.senderType === 'admin'
              ? 'background: #eef2ff; color: #312e81; align-self: flex-start; border-bottom-left-radius: 4px;'
              : 'background: #6366f1; color: white; align-self: flex-end; border-bottom-right-radius: 4px;'}
          "
        >
          <div style="margin: 0;">{@html renderMarkdown(msg.body)}</div>
          <span style="font-size: 10px; opacity: 0.7; display: block; margin-top: 4px;">
            {state.formatTime(msg.createdAt)}
          </span>
        </div>
      {/each}
    </div>

    <!-- Refresh + reply -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button
        onclick={state.refreshMessages}
        disabled={state.loading}
        style="
          padding: 6px;
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #6b7280;
        "
      >
        {state.loading ? 'Refreshing...' : 'Refresh messages'}
      </button>
      <form onsubmit={state.handleReply} style="display: flex; gap: 8px;">
        <input
          type="text"
          placeholder="Type a message..."
          bind:value={state.newMessage}
          style="
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
          "
        />
        <button
          type="submit"
          disabled={state.sending || !state.newMessage.trim()}
          style="
            padding: 8px 14px;
            background-color: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            opacity: {state.sending || !state.newMessage.trim() ? '0.5' : '1'};
          "
        >
          Send
        </button>
      </form>
    </div>
  {/if}
</div>
