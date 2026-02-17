<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'
  import Markdown from '$lib/components/Markdown.svelte'
  import { createConversationPageState } from './page-state.svelte'

  let { data }: { data: PageData } = $props()

  const state = createConversationPageState(data)
</script>

<svelte:head>
  <title>{data.conversation?.subject || $_('contact.conversation')}</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  {#if !data.conversation}
    <div class="text-center py-12 text-gray-400">{$_('contact.conversation_not_found')}</div>
  {:else}
    <div>
      <a href="/{$page.params.locale}/contact" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; {$_('help.back_short')}</a>
      <h1 class="mt-4 text-2xl font-bold text-gray-900">
        {data.conversation.subject || $_('contact.conversation')}
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        {$_('contact.status', { values: { status: data.conversation.status } })}
      </p>
    </div>

    <div class="mt-8 space-y-4">
      {#each state.messages as msg}
        <div class="p-4 rounded-xl border {msg.senderType === 'admin' ? 'border-indigo-200 bg-indigo-50 ml-8' : 'border-gray-200 bg-white mr-8'}">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium {msg.senderType === 'admin' ? 'text-indigo-700' : 'text-gray-900'}">
              {msg.senderType === 'admin' ? $_('contact.support') : $_('contact.you')}
            </span>
            <span class="text-xs text-gray-400">{state.formatTime(msg.createdAt)}</span>
          </div>
          <div class="mt-1"><Markdown content={msg.body} /></div>
        </div>
      {/each}
    </div>

    {#if data.conversation.status !== 'closed'}
      <form onsubmit={state.handleReply} class="mt-6">
        <textarea
          bind:value={state.newMessage}
          rows={3}
          placeholder={$_('contact.reply_placeholder')}
          class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        ></textarea>
        <button
          type="submit"
          disabled={state.sending || !state.newMessage.trim()}
          class="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {state.sending ? $_('contact.sending') : $_('contact.send_reply')}
        </button>
      </form>
    {:else}
      <div class="mt-6 text-center text-gray-400 text-sm">{$_('contact.closed')}</div>
    {/if}
  {/if}
</div>
