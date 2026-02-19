<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button, Input, Checkbox, ColorPicker } from '@heedback/ui-kit'
  import { LOCALE_LABELS } from '@heedback/shared'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'
  import { addToast } from '../lib/stores/toast'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'

  let { orgId }: { orgId: string } = $props()

  let name = $state('')
  let brandColor = $state('#6366f1')
  let defaultLocale = $state('en')
  let supportedLocales = $state<string[]>(['en'])
  let feedbackEnabled = $state(true)
  let helpCenterEnabled = $state(true)
  let portalAuthRequired = $state(false)
  let saving = $state(false)

  currentOrg.subscribe((org) => {
    if (org) {
      name = org.name
      const settings = org.settings as Record<string, unknown>
      brandColor = (settings?.brandColor as string) || '#6366f1'
      defaultLocale = (settings?.defaultLocale as string) || 'en'
      supportedLocales = (settings?.supportedLocales as string[]) || ['en']
      feedbackEnabled = (settings?.feedbackEnabled as boolean) ?? true
      helpCenterEnabled = (settings?.helpCenterEnabled as boolean) ?? true
      portalAuthRequired = (settings?.portalAuthRequired as boolean) ?? false
    }
  })

  function toggleLocale(code: string) {
    if (supportedLocales.includes(code)) {
      if (supportedLocales.length <= 1) return
      supportedLocales = supportedLocales.filter((l) => l !== code)
      // Reset default if removed
      if (defaultLocale === code) defaultLocale = supportedLocales[0]
    } else {
      supportedLocales = [...supportedLocales, code]
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true

    try {
      await api.put(`/organizations/${orgId}`, {
        name,
        settings: {
          brandColor,
          defaultLocale,
          supportedLocales,
          feedbackEnabled,
          helpCenterEnabled,
          portalAuthRequired,
        },
      })
      addToast($_('success.saved'), 'success')
    } finally {
      saving = false
    }
  }
</script>

<div class="max-w-2xl">
  <SettingsTabs />
  <h1 class="text-2xl font-semibold text-slate-900">{$_('settings.title')}</h1>
  <p class="mt-1 text-sm text-slate-500">{$_('settings.subtitle')}</p>

  <form onsubmit={handleSubmit} class="mt-8 space-y-6">
    <Input id="name" label={$_('settings.org_name')} bind:value={name} required />

    <ColorPicker id="brandColor" label={$_('settings.brand_color')} bind:value={brandColor} />

    <!-- Content language picker replaces the old defaultLocale text input -->
    <div>
      <h3 class="text-sm font-medium text-slate-700 mb-3">{$_('settings.content_languages')}</h3>
      <div class="space-y-1">
        {#each Object.entries(LOCALE_LABELS) as [code, label]}
          <div class="flex items-center justify-between py-1.5">
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                checked={supportedLocales.includes(code)}
                onchange={() => toggleLocale(code)}
                class="rounded border-slate-300"
              />
              <span class="text-sm text-slate-700">{label} ({code})</span>
            </label>
            {#if supportedLocales.includes(code)}
              <button
                type="button"
                onclick={() => (defaultLocale = code)}
                class="text-xs {defaultLocale === code ? 'text-indigo-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}"
              >
                {defaultLocale === code ? $_('settings.default') : $_('settings.set_default')}
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <div class="space-y-3">
      <Checkbox label={$_('settings.enable_help_center')} bind:checked={helpCenterEnabled} />
      <Checkbox label={$_('settings.enable_feedback')} bind:checked={feedbackEnabled} />
      <Checkbox label={$_('settings.require_auth')} bind:checked={portalAuthRequired} />
    </div>

    <Button type="submit" loading={saving}>
      {saving ? $_('common.saving') : $_('settings.save')}
    </Button>
  </form>
</div>
