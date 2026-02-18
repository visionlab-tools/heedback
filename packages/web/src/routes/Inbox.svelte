<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Badge, Card, Select, PageHeader, EmptyState, LoadingSpinner } from '@heedback/ui-kit'
  import { createInboxState } from './Inbox.svelte.ts'

  let { orgSlug }: { orgSlug: string } = $props()

  const state = createInboxState()

  onMount(state.loadConversations)
</script>

<div>
  <PageHeader title={$_('inbox.title')} subtitle={$_('inbox.subtitle')} />

  <div class="flex gap-4 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
    <Select bind:value={state.statusFilter} onchange={state.loadConversations}>
      <option value="">{$_('inbox.all_statuses')}</option>
      <option value="open">{$_('inbox.status_open')}</option>
      <option value="assigned">{$_('inbox.status_assigned')}</option>
      <option value="resolved">{$_('inbox.status_resolved')}</option>
      <option value="closed">{$_('inbox.status_closed')}</option>
    </Select>
  </div>

  {#if state.loading}
    <LoadingSpinner />
  {:else if state.conversations.length === 0}
    <EmptyState message={$_('inbox.empty')} />
  {:else}
    <div class="mt-4 space-y-3">
      {#each state.conversations as convo}
        <Card href="/{orgSlug}/inbox/{convo.id}" padding="sm" interactive>
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <Badge variant={state.statusVariant(convo.status)}>{convo.status}</Badge>
                <span class="text-xs text-slate-400">{state.channelLabel(convo.channel)}</span>
              </div>
              <h3 class="mt-1 font-medium text-slate-900 truncate">{convo.subject || $_('inbox.no_subject')}</h3>
              <p class="mt-1 text-xs text-slate-500">
                {convo.endUser?.name || convo.endUser?.email || $_('common.anonymous')}
                {#if convo.assignedTo}
                  <span class="text-slate-400">· {$_('inbox.assigned_to', { values: { name: convo.assignedTo.fullName } })}</span>
                {/if}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 ml-4 shrink-0">
              <span class="text-xs text-slate-400">{state.timeAgo(convo.lastMessageAt)}</span>
              <span class="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{$_('inbox.msg_count', { values: { count: convo.messageCount } })}</span>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
