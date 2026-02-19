<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Badge, Button, Select, Textarea, Checkbox } from '@heedback/ui-kit'
  import Markdown from '../lib/components/Markdown.svelte'
  import type { createInboxState } from './Inbox.svelte.ts'

  let { state }: { state: ReturnType<typeof createInboxState> } = $props()

  const endUser = $derived(state.conversation?.endUser)
  const hasContactInfo = $derived(endUser?.name || endUser?.email)
</script>

<div class="flex flex-1 min-h-0">
  <!-- Center: messages + reply -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Messages thread -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      {#each state.messages as msg}
        <div class="p-3 rounded-lg border {msg.isInternal ? 'border-amber-200 bg-amber-50' : msg.senderType === 'admin' ? 'border-indigo-100 bg-indigo-50 ml-8' : 'border-slate-200 bg-white mr-8'}">
          <div class="flex items-center justify-between text-sm text-slate-500">
            <div class="flex items-center gap-2">
              <span class="font-medium {msg.senderType === 'admin' ? 'text-indigo-700' : 'text-slate-900'}">
                {msg.senderType === 'admin' ? $_('conversation.you') : endUser?.name || $_('conversation.user')}
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
    <form onsubmit={state.handleSend} class="p-4 border-t border-slate-200">
      <Textarea bind:value={state.newMessage} rows={3} placeholder={$_('conversation.reply_placeholder')} />
      <div class="mt-2 flex items-center gap-4">
        <Button type="submit" disabled={state.sending || !state.newMessage.trim()} size="sm">
          {state.sending ? $_('conversation.sending') : $_('conversation.send_reply')}
        </Button>
        <Checkbox label={$_('conversation.internal_note')} bind:checked={state.isInternal} />
      </div>
    </form>
  </div>

  <!-- Right panel: contact + details + actions -->
  <div class="w-72 shrink-0 border-l border-slate-200 bg-slate-50 overflow-y-auto">
    <!-- Contact -->
    <div class="p-4 border-b border-slate-200">
      <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{$_('conversation.contact')}</h3>
      {#if hasContactInfo}
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
            {(endUser?.name || endUser?.email || '?')[0].toUpperCase()}
          </div>
          <div class="min-w-0">
            {#if endUser?.name}
              <p class="text-sm font-medium text-slate-900 truncate">{endUser.name}</p>
            {/if}
            {#if endUser?.email}
              <p class="text-xs text-slate-500 truncate">{endUser.email}</p>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold shrink-0">?</div>
          <p class="text-sm text-slate-400">{$_('conversation.anonymous')}</p>
        </div>
      {/if}
    </div>

    <!-- Details -->
    <div class="p-4 border-b border-slate-200 space-y-3">
      <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wide">{$_('conversation.details')}</h3>

      <div>
        <label class="text-xs text-slate-500">{$_('conversation.status')}</label>
        <Select bind:value={state.newStatus} onchange={state.handleStatusChange}>
          <option value="open">{$_('inbox.status_open')}</option>
          <option value="assigned">{$_('inbox.status_assigned')}</option>
          <option value="resolved">{$_('inbox.status_resolved')}</option>
          <option value="closed">{$_('inbox.status_closed')}</option>
        </Select>
      </div>

      <div>
        <label class="text-xs text-slate-500">{$_('conversation.assign_to')}</label>
        <Select bind:value={state.assigneeId} onchange={state.handleAssign}>
          <option value="">{$_('conversation.unassigned')}</option>
          {#each state.members as member}
            <option value={member.user.id}>{member.user.fullName}</option>
          {/each}
        </Select>
      </div>

      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">{$_('conversation.channel')}</span>
        <Badge variant="neutral">{state.channelLabel(state.conversation?.channel ?? '')}</Badge>
      </div>

      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">{$_('conversation.created')}</span>
        <span class="text-slate-700">{state.formatTime(state.conversation?.createdAt ?? '')}</span>
      </div>

      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">{$_('conversation.messages', { values: { count: state.conversation?.messageCount } })}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-4">
      <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{$_('conversation.actions')}</h3>
      <div class="w-full">
        <Button variant="danger" onclick={() => state.handleDelete()} size="sm">{$_('common.delete')}</Button>
      </div>
    </div>
  </div>
</div>
