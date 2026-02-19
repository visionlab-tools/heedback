<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Badge, Select, EmptyState, LoadingSpinner } from '@heedback/ui-kit'
  import InboxDetail from './InboxDetail.svelte'
  import { createInboxState } from './Inbox.svelte.ts'
  import { fullWidth } from '../lib/stores/layout'

  let { orgId, id }: { orgId: string; id?: string } = $props()

  const state = createInboxState(orgId)

  onMount(() => {
    fullWidth.set(true)
    state.init(id)
  })

  onDestroy(() => {
    fullWidth.set(false)
    state.cleanup()
  })
</script>

<div class="flex flex-col h-full">
  <div class="flex flex-1 min-h-0">
    <!-- Left column: conversation list -->
    <div class="w-80 shrink-0 flex flex-col border-r border-slate-200 bg-white">
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h1 class="text-base font-semibold text-slate-900">{$_('inbox.title')}</h1>
        <Select bind:value={state.statusFilter} onchange={state.loadConversations}>
          <option value="">{$_('inbox.all_statuses')}</option>
          <option value="open">{$_('inbox.status_open')}</option>
          <option value="assigned">{$_('inbox.status_assigned')}</option>
          <option value="resolved">{$_('inbox.status_resolved')}</option>
          <option value="closed">{$_('inbox.status_closed')}</option>
        </Select>
      </div>

      <div class="flex-1 overflow-y-auto">
        {#if state.loading}
          <div class="p-4"><LoadingSpinner /></div>
        {:else if state.conversations.length === 0}
          <div class="p-4"><EmptyState message={$_('inbox.empty')} /></div>
        {:else}
          {#each state.conversations as convo}
            <button
              type="button"
              class="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors
                {state.selectedId === convo.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}"
              onclick={() => state.selectConversation(convo.id)}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <Badge variant={state.statusVariant(convo.status)}>{convo.status}</Badge>
                  <span class="text-xs text-slate-400">{state.channelLabel(convo.channel)}</span>
                </div>
                <span class="text-xs text-slate-400 shrink-0">{state.timeAgo(convo.lastMessageAt)}</span>
              </div>
              <p class="mt-1 text-sm font-medium text-slate-900 truncate">
                {convo.endUser?.name || convo.endUser?.email || $_('common.anonymous')}
              </p>
              <p class="mt-0.5 text-xs text-slate-500 truncate">
                {convo.subject || $_('inbox.no_subject')}
              </p>
            </button>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Right column: conversation detail or empty state -->
    <div class="flex-1 flex flex-col min-w-0 bg-white">
      {#if !state.selectedId}
        <div class="flex-1 flex items-center justify-center text-slate-400">
          {$_('inbox.select_conversation')}
        </div>
      {:else if state.detailLoading}
        <div class="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      {:else if state.conversation}
        <InboxDetail {state} />
      {/if}
    </div>
  </div>
</div>
