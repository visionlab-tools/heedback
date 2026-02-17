<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  let { id }: { id: string } = $props()

  let orgSlug = $state('')
  let conversation = $state<any>(null)
  let messages = $state<any[]>([])
  let loading = $state(true)
  let newMessage = $state('')
  let isInternal = $state(false)
  let newStatus = $state('')
  let sending = $state(false)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(loadConversation)

  async function loadConversation() {
    if (!orgSlug || !id) return
    try {
      const data = await api.get<{ data: any }>(`/org/${orgSlug}/conversations/${id}`)
      conversation = data.data
      messages = data.data.messages || []
      newStatus = conversation.status
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  async function handleStatusChange() {
    if (!conversation || newStatus === conversation.status) return
    await api.patch(`/org/${orgSlug}/conversations/${id}`, { status: newStatus })
    conversation.status = newStatus
  }

  async function handleSend(e: Event) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    sending = true
    try {
      const data = await api.post<{ data: any }>(`/org/${orgSlug}/conversations/${id}/messages`, {
        body: newMessage,
        isInternal,
      })
      messages = [...messages, data.data]
      newMessage = ''
      isInternal = false
    } finally {
      sending = false
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this conversation?')) return
    await api.delete(`/org/${orgSlug}/conversations/${id}`)
    window.history.back()
  }

  function statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString()
  }
</script>

<div class="max-w-4xl">
  {#if loading}
    <div class="text-center text-gray-500">Loading...</div>
  {:else if conversation}
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {conversation.subject || 'Conversation'}
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {conversation.endUser?.name || conversation.endUser?.email || 'Anonymous'}
          · {conversation.channel}
          · {conversation.messageCount} messages
        </p>
      </div>
      <button onclick={handleDelete} class="text-sm text-red-600 hover:text-red-800">Delete</button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <select bind:value={newStatus} onchange={handleStatusChange} class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="open">Open</option>
        <option value="assigned">Assigned</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusBadgeClass(conversation.status)}">
        {conversation.status}
      </span>
    </div>

    <!-- Messages thread -->
    <div class="mt-6 space-y-4">
      {#each messages as msg}
        <div class="p-4 rounded-xl border {msg.isInternal ? 'border-yellow-300 bg-yellow-50' : msg.senderType === 'admin' ? 'border-indigo-200 bg-indigo-50 ml-8' : 'border-gray-200 bg-white mr-8'}">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <span class="font-medium {msg.senderType === 'admin' ? 'text-indigo-700' : 'text-gray-900'}">
                {msg.senderType === 'admin' ? 'You' : conversation.endUser?.name || 'User'}
              </span>
              {#if msg.isInternal}
                <span class="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">Internal</span>
              {/if}
              {#if msg.senderType === 'system'}
                <span class="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">System</span>
              {/if}
            </div>
            <span class="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
          </div>
          <p class="mt-1 text-gray-800 whitespace-pre-wrap">{msg.body}</p>
        </div>
      {/each}
    </div>

    <!-- Reply form -->
    <form onsubmit={handleSend} class="mt-6">
      <textarea
        bind:value={newMessage}
        rows={3}
        placeholder="Type your reply..."
        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      ></textarea>
      <div class="mt-3 flex items-center gap-4">
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Reply'}
        </button>
        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={isInternal} class="rounded border-gray-300" />
          <span class="text-sm text-gray-600">Internal note</span>
        </label>
      </div>
    </form>
  {/if}
</div>
