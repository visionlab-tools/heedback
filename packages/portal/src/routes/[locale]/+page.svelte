<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
</script>

<svelte:head>
  <title>Heedback</title>
  <meta name="description" content={$_('portal.hero_subtitle')} />
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-16">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900">{$_('portal.hero_title')}</h1>
    <p class="mt-4 text-lg text-gray-600">{$_('portal.hero_subtitle')}</p>

    <div class="mt-8 max-w-xl mx-auto">
      <input
        type="search"
        placeholder={$_('portal.search_placeholder')}
        class="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  </div>

  <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
    <a href="/{$page.params.locale}/help" class="block bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
      <h2 class="text-lg font-semibold text-gray-900">{$_('portal.help_center')}</h2>
      <p class="mt-2 text-sm text-gray-500">{$_('portal.help_center_desc')}</p>
    </a>

    <a href="/{$page.params.locale}/feedback" class="block bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
      <h2 class="text-lg font-semibold text-gray-900">{$_('portal.feedback')}</h2>
      <p class="mt-2 text-sm text-gray-500">{$_('portal.feedback_desc')}</p>
    </a>

    <a href="/{$page.params.locale}/changelog" class="block bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
      <h2 class="text-lg font-semibold text-gray-900">{$_('portal.changelog')}</h2>
      <p class="mt-2 text-sm text-gray-500">{$_('portal.changelog_desc')}</p>
    </a>
  </div>
</div>
