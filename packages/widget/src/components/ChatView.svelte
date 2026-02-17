<script lang="ts">
  import { widgetApi } from '../api/widget-client'

  let {
    org,
    user = null,
  }: {
    org: string
    user?: any
  } = $props()

  let conversationId = $state<string | null>(null)
  let messages = $state<any[]>([])
  let newMessage = $state('')
  let sending = $state(false)
  let loading = $state(false)
  let subject = $state('')
  let started = $state(false)

  async function handleStart(e: Event) {
    e.preventDefault()
    if (!newMessage.trim()) return
    sending = true
    try {
      const data = await widgetApi.startConversation(org, {
        subject: subject || undefined,
        body: newMessage,
        channel: 'widget',
        endUserEmail: user?.email,
        endUserName: user?.name,
      })
      conversationId = data.data.id
      started = true
      messages = [
        {
          id: 'initial',
          senderType: 'end_user',
          body: newMessage,
          createdAt: new Date().toISOString(),
        },
      ]
      newMessage = ''
      subject = ''
    } catch {
      // Handle error
    } finally {
      sending = false
    }
  }

  async function handleReply(e: Event) {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || sending) return
    sending = true
    try {
      const data = await widgetApi.replyToConversation(org, conversationId, {
        body: newMessage,
      })
      messages = [...messages, data.data]
      newMessage = ''
    } catch {
      // Handle error
    } finally {
      sending = false
    }
  }

  async function refreshMessages() {
    if (!conversationId) return
    loading = true
    try {
      const data = await widgetApi.getConversation(org, conversationId)
      messages = data.data.messages || []
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
</script>

<div style="display: flex; flex-direction: column; height: 100%;">
  {#if !started}
    <!-- New conversation form -->
    <form onsubmit={handleStart} style="display: flex; flex-direction: column; gap: 10px;">
      <input
        type="text"
        placeholder="Subject (optional)"
        bind:value={subject}
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
        bind:value={newMessage}
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
        disabled={sending || !newMessage.trim()}
        style="
          padding: 10px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          opacity: {sending || !newMessage.trim() ? '0.5' : '1'};
        "
      >
        {sending ? 'Sending...' : 'Start Conversation'}
      </button>
    </form>
  {:else}
    <!-- Conversation thread -->
    <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
      {#each messages as msg}
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
          <p style="margin: 0; white-space: pre-wrap;">{msg.body}</p>
          <span style="font-size: 10px; opacity: 0.7; display: block; margin-top: 4px;">
            {formatTime(msg.createdAt)}
          </span>
        </div>
      {/each}
    </div>

    <!-- Refresh + reply -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button
        onclick={refreshMessages}
        disabled={loading}
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
        {loading ? 'Refreshing...' : 'Refresh messages'}
      </button>
      <form onsubmit={handleReply} style="display: flex; gap: 8px;">
        <input
          type="text"
          placeholder="Type a message..."
          bind:value={newMessage}
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
          disabled={sending || !newMessage.trim()}
          style="
            padding: 8px 14px;
            background-color: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            opacity: {sending || !newMessage.trim() ? '0.5' : '1'};
          "
        >
          Send
        </button>
      </form>
    </div>
  {/if}
</div>
