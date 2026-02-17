<script lang="ts">
  import { t } from '../lib/i18n'
  import { renderMarkdown } from '../utils/markdown'
  import { createChatViewState } from './ChatView.svelte.ts'

  let {
    org,
    user = null,
    color = '#6366f1',
    locale = 'en',
  }: {
    org: string
    user?: any
    color?: string
    locale?: string
  } = $props()

  const state = createChatViewState(org, user)
</script>

<div class="hb-chat">
  {#if !state.started}
    <!-- Welcome + new conversation -->
    <div class="hb-chat-welcome">
      <div class="hb-chat-welcome-icon" style="background: {color}15;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h3 class="hb-chat-welcome-title">{t(locale, 'chat.welcome_title')}</h3>
      <p class="hb-chat-welcome-text">{t(locale, 'chat.welcome_text')}</p>
    </div>

    <form onsubmit={state.handleStart} class="hb-chat-form">
      <input
        type="text"
        placeholder={t(locale, 'chat.subject_placeholder')}
        bind:value={state.subject}
        class="hb-chat-input"
      />
      <textarea
        placeholder={t(locale, 'chat.message_placeholder')}
        bind:value={state.newMessage}
        rows={4}
        class="hb-chat-textarea"
      ></textarea>
      <button
        type="submit"
        disabled={state.sending || !state.newMessage.trim()}
        class="hb-chat-send-btn"
        style="background: {state.sending || !state.newMessage.trim() ? '#d1d5db' : color};"
      >
        {#if state.sending}
          <span class="hb-chat-spinner"></span>
          {t(locale, 'chat.sending')}
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          {t(locale, 'chat.start')}
        {/if}
      </button>
    </form>
  {:else}
    <!-- Conversation thread -->
    <div class="hb-chat-messages">
      {#each state.messages as msg}
        <div
          class="hb-chat-bubble"
          class:hb-chat-bubble-user={msg.senderType !== 'admin'}
          class:hb-chat-bubble-admin={msg.senderType === 'admin'}
          style={msg.senderType !== 'admin' ? `background: ${color}; color: white;` : ''}
        >
          {#if msg.senderType === 'admin'}
            <span class="hb-chat-bubble-sender">{t(locale, 'chat.support')}</span>
          {/if}
          <div class="hb-chat-bubble-body">{@html renderMarkdown(msg.body)}</div>
          <span class="hb-chat-bubble-time">{state.formatTime(msg.createdAt)}</span>
        </div>
      {/each}
    </div>

    <!-- Reply input -->
    <form onsubmit={state.handleReply} class="hb-chat-reply">
      <div class="hb-chat-reply-row">
        <input
          type="text"
          placeholder={t(locale, 'chat.reply_placeholder')}
          bind:value={state.newMessage}
          class="hb-chat-reply-input"
        />
        <button
          type="submit"
          disabled={state.sending || !state.newMessage.trim()}
          class="hb-chat-reply-btn"
          style="background: {state.sending || !state.newMessage.trim() ? '#d1d5db' : color};"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .hb-chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 12px;
  }

  /* Welcome */
  .hb-chat-welcome {
    text-align: center;
    padding: 8px 0 16px;
  }
  .hb-chat-welcome-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }
  .hb-chat-welcome-title {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  .hb-chat-welcome-text {
    font-size: 12px;
    color: #9ca3af;
    margin: 4px 0 0;
  }

  /* Form */
  .hb-chat-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .hb-chat-input, .hb-chat-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    background: #f9fafb;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .hb-chat-input:focus, .hb-chat-textarea:focus {
    border-color: #a5b4fc;
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
  }
  .hb-chat-textarea {
    resize: none;
    line-height: 1.5;
  }
  .hb-chat-send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: opacity 0.15s;
    font-family: inherit;
  }
  .hb-chat-send-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .hb-chat-send-btn:disabled {
    cursor: not-allowed;
  }

  .hb-chat-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: hb-cspin 0.6s linear infinite;
  }
  @keyframes hb-cspin {
    to { transform: rotate(360deg); }
  }

  /* Messages */
  .hb-chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 8px;
  }
  .hb-chat-messages::-webkit-scrollbar {
    width: 3px;
  }
  .hb-chat-messages::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  .hb-chat-bubble {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
  }
  .hb-chat-bubble-admin {
    background: #f3f4f6;
    color: #111827;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  .hb-chat-bubble-user {
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  .hb-chat-bubble-sender {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 2px;
  }
  .hb-chat-bubble-body {
    margin: 0;
  }
  .hb-chat-bubble-body :global(p) {
    margin: 0 0 4px;
  }
  .hb-chat-bubble-body :global(p:last-child) {
    margin: 0;
  }
  .hb-chat-bubble-time {
    font-size: 10px;
    opacity: 0.6;
    display: block;
    margin-top: 4px;
  }

  /* Reply */
  .hb-chat-reply {
    border-top: 1px solid #f3f4f6;
    padding-top: 12px;
  }
  .hb-chat-reply-row {
    display: flex;
    gap: 8px;
  }
  .hb-chat-reply-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    background: #f9fafb;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .hb-chat-reply-input:focus {
    border-color: #a5b4fc;
    background: white;
  }
  .hb-chat-reply-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }
  .hb-chat-reply-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .hb-chat-reply-btn:disabled {
    cursor: not-allowed;
  }
</style>
