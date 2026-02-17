<script lang="ts">
  import { page } from '$app/stores'
  import { _ } from 'svelte-i18n'
  import LanguageSwitcher from './LanguageSwitcher.svelte'

  let { orgName = 'Heedback', brandColor = '#6366f1' }: { orgName?: string; brandColor?: string } = $props()
</script>

<header class="border-b border-gray-200 bg-white">
  <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/{$page.params.locale}" class="text-xl font-bold" style="color: {brandColor}">
      {orgName}
    </a>
    <nav class="flex items-center gap-6 text-sm font-medium text-gray-600">
      <a href="/{$page.params.locale}/help" class="hover:text-gray-900">{$_('portal.help_center')}</a>
      <a href="/{$page.params.locale}/feedback" class="hover:text-gray-900">{$_('portal.feedback')}</a>
      <a href="/{$page.params.locale}/roadmap" class="hover:text-gray-900">{$_('portal.roadmap')}</a>
      <a href="/{$page.params.locale}/changelog" class="hover:text-gray-900">{$_('portal.changelog')}</a>
      <a href="/{$page.params.locale}/contact" class="hover:text-gray-900">{$_('portal.contact')}</a>
      <LanguageSwitcher />
    </nav>
  </div>
</header>
