<script lang="ts">
  import { onMount } from 'svelte'
  import { link } from 'svelte-routing'
  import { createInboxState } from './Inbox.svelte.ts'

  const state = createInboxState()

  onMount(state.loadConversations)
</script>

<div>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Inbox</h1>
      <p class="mt-1 text-sm text-gray-500">Conversations with your users.</p>
    </div>
  </div>

  <div class="mt-6 flex gap-4">
    <select bind:value={state.statusFilter} onchange={state.loadConversations} class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
      <option value="">All statuses</option>
      <option value="open">Open</option>
      <option value="assigned">Assigned</option>
      <option value="resolved">Resolved</option>
      <option value="closed">Closed</option>
    </select>
  </div>

  {#if state.loading}
    <div class="mt-8 text-center text-gray-500">Loading...</div>
  {:else if state.conversations.length === 0}
    <div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
      <p class="text-gray-500">No conversations yet.</p>
    </div>
  {:else}
    <div class="mt-6 space-y-3">
      {#each state.conversations as convo}
        <a href="/inbox/{convo.id}" use:link class="block bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {state.statusBadgeClass(convo.status)}">
                  {convo.status}
                </span>
                <span class="text-xs text-gray-400">{state.channelLabel(convo.channel)}</span>
              </div>
              <h3 class="mt-1 font-medium text-gray-900 truncate">
                {convo.subject || 'No subject'}
              </h3>
              <p class="mt-1 text-xs text-gray-500">
                {convo.endUser?.name || convo.endUser?.email || 'Anonymous'}
                {#if convo.assignedTo}
                  <span class="text-gray-400">· assigned to {convo.assignedTo.fullName}</span>
                {/if}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 ml-4 shrink-0">
              <span class="text-xs text-gray-400">{state.timeAgo(convo.lastMessageAt)}</span>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {convo.messageCount} msg
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
