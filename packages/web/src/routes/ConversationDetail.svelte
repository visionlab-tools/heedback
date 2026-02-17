<script lang="ts">
  import { onMount } from 'svelte'
  import Markdown from '../lib/components/Markdown.svelte'
  import { createConversationDetailState } from './ConversationDetail.svelte.ts'

  let { id }: { id: string } = $props()

  const state = createConversationDetailState(id)

  onMount(state.loadConversation)
</script>

<div class="max-w-4xl">
  {#if state.loading}
    <div class="text-center text-gray-500">Loading...</div>
  {:else if state.conversation}
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {state.conversation.subject || 'Conversation'}
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {state.conversation.endUser?.name || state.conversation.endUser?.email || 'Anonymous'}
          · {state.conversation.channel}
          · {state.conversation.messageCount} messages
        </p>
      </div>
      <button onclick={state.handleDelete} class="text-sm text-red-600 hover:text-red-800">Delete</button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <select bind:value={state.newStatus} onchange={state.handleStatusChange} class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="open">Open</option>
        <option value="assigned">Assigned</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {state.statusBadgeClass(state.conversation.status)}">
        {state.conversation.status}
      </span>
    </div>

    <!-- Messages thread -->
    <div class="mt-6 space-y-4">
      {#each state.messages as msg}
        <div class="p-4 rounded-xl border {msg.isInternal ? 'border-yellow-300 bg-yellow-50' : msg.senderType === 'admin' ? 'border-indigo-200 bg-indigo-50 ml-8' : 'border-gray-200 bg-white mr-8'}">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <span class="font-medium {msg.senderType === 'admin' ? 'text-indigo-700' : 'text-gray-900'}">
                {msg.senderType === 'admin' ? 'You' : state.conversation.endUser?.name || 'User'}
              </span>
              {#if msg.isInternal}
                <span class="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">Internal</span>
              {/if}
              {#if msg.senderType === 'system'}
                <span class="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">System</span>
              {/if}
            </div>
            <span class="text-xs text-gray-400">{state.formatTime(msg.createdAt)}</span>
          </div>
          <div class="mt-1"><Markdown content={msg.body} /></div>
        </div>
      {/each}
    </div>

    <!-- Reply form -->
    <form onsubmit={state.handleSend} class="mt-6">
      <textarea
        bind:value={state.newMessage}
        rows={3}
        placeholder="Type your reply..."
        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      ></textarea>
      <div class="mt-3 flex items-center gap-4">
        <button
          type="submit"
          disabled={state.sending || !state.newMessage.trim()}
          class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {state.sending ? 'Sending...' : 'Send Reply'}
        </button>
        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={state.isInternal} class="rounded border-gray-300" />
          <span class="text-sm text-gray-600">Internal note</span>
        </label>
      </div>
    </form>
  {/if}
</div>
