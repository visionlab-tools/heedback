<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import { createContactPageState } from './page-state.svelte'

  const state = createContactPageState()
</script>

<svelte:head>
  <title>{$_('contact.title')}</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900">{$_('contact.title')}</h1>
  <p class="mt-2 text-gray-600">{$_('contact.subtitle')}</p>

  {#if state.conversationId}
    <div class="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <p class="text-green-800 font-medium">{$_('contact.success')}</p>
      <p class="mt-2 text-sm text-green-600">{$_('contact.success_detail')}</p>
      <a
        href="/{$page.params.locale}/contact/{state.conversationId}"
        class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
      >
        {$_('contact.view_conversation')}
      </a>
    </div>
  {:else}
    <form onsubmit={state.handleSubmit} class="mt-8 space-y-5">
      {#if state.error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
      {/if}

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">{$_('contact.name')}</label>
          <input
            id="name"
            type="text"
            bind:value={state.name}
            placeholder={$_('contact.name_placeholder')}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">{$_('contact.email')}</label>
          <input
            id="email"
            type="email"
            bind:value={state.email}
            placeholder={$_('contact.email_placeholder')}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700">{$_('contact.subject')}</label>
        <input
          id="subject"
          type="text"
          bind:value={state.subject}
          placeholder={$_('contact.subject_placeholder')}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="body" class="block text-sm font-medium text-gray-700">{$_('contact.message')}</label>
        <textarea
          id="body"
          bind:value={state.body}
          rows={5}
          required
          placeholder={$_('contact.message_placeholder')}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={state.sending || !state.body.trim()}
        class="w-full px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {state.sending ? $_('contact.sending') : $_('contact.send')}
      </button>
    </form>
  {/if}
</div>
