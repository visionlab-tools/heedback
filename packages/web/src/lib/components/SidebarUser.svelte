<!--
  Bottom section of the sidebar showing the current user, language switcher, and logout.
-->
<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { LogOut, Globe } from 'lucide-svelte'
  import { UI_LOCALES, LOCALE_LABELS } from '@heedback/shared'
  import { setUiLocale, getStoredLocale } from '../i18n/index'

  let { user, onLogout }: {
    user: { name: string; email: string }
    onLogout: () => void
  } = $props()

  let currentLocale = $state(getStoredLocale())
  let showPicker = $state(false)

  function selectLocale(loc: string) {
    currentLocale = loc
    setUiLocale(loc)
    showPicker = false
  }
</script>

<div class="px-4 py-4 border-t border-white/10">
  <!-- Language switcher -->
  <div class="relative mb-2">
    <button
      onclick={() => (showPicker = !showPicker)}
      class="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
    >
      <Globe size={14} />
      <span>{LOCALE_LABELS[currentLocale] ?? currentLocale}</span>
    </button>

    {#if showPicker}
      <div class="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
        {#each UI_LOCALES as loc}
          <button
            onclick={() => selectLocale(loc)}
            class="block w-full text-left px-3 py-2 text-sm transition-colors
              {loc === currentLocale ? 'text-indigo-400 bg-white/5 font-medium' : 'text-slate-300 hover:bg-white/5'}"
          >
            {LOCALE_LABELS[loc]}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- User info + logout -->
  <div class="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors">
    <div class="min-w-0">
      <p class="text-sm font-medium text-slate-200 truncate">{user.name}</p>
      <p class="text-xs text-slate-500 truncate">{user.email}</p>
    </div>
    <button
      onclick={onLogout}
      class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
      title={$_('common.logout')}
    >
      <LogOut size={16} />
    </button>
  </div>
</div>
