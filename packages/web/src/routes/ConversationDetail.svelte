<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Badge, Select, Textarea, Checkbox, LoadingSpinner } from '@heedback/ui-kit'
  import Markdown from '../lib/components/Markdown.svelte'
  import { createConversationDetailState } from './ConversationDetail.svelte.ts'

  let { id }: { id: string } = $props()

  const state = createConversationDetailState(id)

  onMount(state.loadConversation)
</script>

<div class="max-w-4xl">
  {#if state.loading}
    <LoadingSpinner />
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
      <Button variant="danger" onclick={state.handleDelete} size="sm">Delete</Button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <Select bind:value={state.newStatus} onchange={state.handleStatusChange}>
        <option value="open">Open</option>
        <option value="assigned">Assigned</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </Select>
      <Badge variant={state.statusVariant(state.conversation.status)}>
        {state.conversation.status}
      </Badge>
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
                <Badge variant="warning">Internal</Badge>
              {/if}
              {#if msg.senderType === 'system'}
                <Badge variant="neutral">System</Badge>
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
      <Textarea bind:value={state.newMessage} rows={3} placeholder="Type your reply..." />
      <div class="mt-3 flex items-center gap-4">
        <Button type="submit" disabled={state.sending || !state.newMessage.trim()} size="sm">
          {state.sending ? 'Sending...' : 'Send Reply'}
        </Button>
        <Checkbox label="Internal note" bind:checked={state.isInternal} />
      </div>
    </form>
  {/if}
</div>
