<script lang="ts">
  import { onMount } from 'svelte'
  import { Badge, Card, Select, PageHeader, EmptyState, LoadingSpinner } from '@heedback/ui-kit'
  import { createInboxState } from './Inbox.svelte.ts'

  const state = createInboxState()

  onMount(state.loadConversations)
</script>

<div>
  <PageHeader title="Inbox" subtitle="Conversations with your users." />

  <div class="mt-6 flex gap-4">
    <Select bind:value={state.statusFilter} onchange={state.loadConversations}>
      <option value="">All statuses</option>
      <option value="open">Open</option>
      <option value="assigned">Assigned</option>
      <option value="resolved">Resolved</option>
      <option value="closed">Closed</option>
    </Select>
  </div>

  {#if state.loading}
    <LoadingSpinner />
  {:else if state.conversations.length === 0}
    <EmptyState message="No conversations yet." />
  {:else}
    <div class="mt-6 space-y-3">
      {#each state.conversations as convo}
        <Card href="/inbox/{convo.id}" padding="sm" interactive>
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <Badge variant={state.statusVariant(convo.status)}>{convo.status}</Badge>
                <span class="text-xs text-gray-400">{state.channelLabel(convo.channel)}</span>
              </div>
              <h3 class="mt-1 font-medium text-gray-900 truncate">{convo.subject || 'No subject'}</h3>
              <p class="mt-1 text-xs text-gray-500">
                {convo.endUser?.name || convo.endUser?.email || 'Anonymous'}
                {#if convo.assignedTo}
                  <span class="text-gray-400">· assigned to {convo.assignedTo.fullName}</span>
                {/if}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 ml-4 shrink-0">
              <span class="text-xs text-gray-400">{state.timeAgo(convo.lastMessageAt)}</span>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{convo.messageCount} msg</span>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
