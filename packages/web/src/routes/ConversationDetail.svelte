<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Badge, Select, Textarea, Checkbox, LoadingSpinner } from '@heedback/ui-kit'
  import Markdown from '../lib/components/Markdown.svelte'
  import { createConversationDetailState } from './ConversationDetail.svelte.ts'

  let { id, orgSlug }: { id: string; orgSlug: string } = $props()

  const state = createConversationDetailState(id)

  onMount(state.loadConversation)
</script>

<div class="max-w-4xl">
  {#if state.loading}
    <LoadingSpinner />
  {:else if state.conversation}
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">
          {state.conversation.subject || $_('conversation.fallback_title')}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          {state.conversation.endUser?.name || state.conversation.endUser?.email || $_('common.anonymous')}
          · {state.conversation.channel}
          · {$_('conversation.messages', { values: { count: state.conversation.messageCount } })}
        </p>
      </div>
      <Button variant="danger" onclick={state.handleDelete} size="sm">{$_('common.delete')}</Button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <Select bind:value={state.newStatus} onchange={state.handleStatusChange}>
        <option value="open">{$_('inbox.status_open')}</option>
        <option value="assigned">{$_('inbox.status_assigned')}</option>
        <option value="resolved">{$_('inbox.status_resolved')}</option>
        <option value="closed">{$_('inbox.status_closed')}</option>
      </Select>
      <Badge variant={state.statusVariant(state.conversation.status)}>
        {state.conversation.status}
      </Badge>
    </div>

    <!-- Messages thread -->
    <div class="mt-6 space-y-4">
      {#each state.messages as msg}
        <div class="p-4 rounded-lg border {msg.isInternal ? 'border-amber-200 bg-amber-50' : msg.senderType === 'admin' ? 'border-indigo-100 bg-indigo-50 ml-8' : 'border-slate-200 bg-white mr-8'}">
          <div class="flex items-center justify-between text-sm text-slate-500">
            <div class="flex items-center gap-2">
              <span class="font-medium {msg.senderType === 'admin' ? 'text-indigo-700' : 'text-slate-900'}">
                {msg.senderType === 'admin' ? $_('conversation.you') : state.conversation.endUser?.name || $_('conversation.user')}
              </span>
              {#if msg.isInternal}
                <Badge variant="warning">{$_('conversation.internal')}</Badge>
              {/if}
              {#if msg.senderType === 'system'}
                <Badge variant="neutral">{$_('conversation.system')}</Badge>
              {/if}
            </div>
            <span class="text-xs text-slate-400">{state.formatTime(msg.createdAt)}</span>
          </div>
          <div class="mt-1"><Markdown content={msg.body} /></div>
        </div>
      {/each}
    </div>

    <!-- Reply form -->
    <form onsubmit={state.handleSend} class="mt-6">
      <Textarea bind:value={state.newMessage} rows={3} placeholder={$_('conversation.reply_placeholder')} />
      <div class="mt-3 flex items-center gap-4">
        <Button type="submit" disabled={state.sending || !state.newMessage.trim()} size="sm">
          {state.sending ? $_('conversation.sending') : $_('conversation.send_reply')}
        </Button>
        <Checkbox label={$_('conversation.internal_note')} bind:checked={state.isInternal} />
      </div>
    </form>
  {/if}
</div>
