<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button, Input, Checkbox, Alert } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'

  let orgSlug = $state('')
  let name = $state('')
  let brandColor = $state('#6366f1')
  let defaultLocale = $state('en')
  let feedbackEnabled = $state(true)
  let helpCenterEnabled = $state(true)
  let portalAuthRequired = $state(false)
  let saving = $state(false)
  let success = $state(false)

  currentOrg.subscribe((org) => {
    if (org) {
      orgSlug = org.slug
      name = org.name
      const settings = org.settings as Record<string, unknown>
      brandColor = (settings?.brandColor as string) || '#6366f1'
      defaultLocale = (settings?.defaultLocale as string) || 'en'
      feedbackEnabled = (settings?.feedbackEnabled as boolean) ?? true
      helpCenterEnabled = (settings?.helpCenterEnabled as boolean) ?? true
      portalAuthRequired = (settings?.portalAuthRequired as boolean) ?? false
    }
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    success = false

    try {
      await api.patch(`/org/${orgSlug}`, {
        name,
        settings: {
          brandColor,
          defaultLocale,
          feedbackEnabled,
          helpCenterEnabled,
          portalAuthRequired,
        },
      })
      success = true
      setTimeout(() => (success = false), 3000)
    } catch {
      // Handle error
    } finally {
      saving = false
    }
  }
</script>

<div class="max-w-2xl">
  <SettingsTabs />
  <h1 class="text-2xl font-semibold text-slate-900">{$_('settings.title')}</h1>
  <p class="mt-1 text-sm text-slate-500">{$_('settings.subtitle')}</p>

  {#if success}
    <div class="mt-4">
      <Alert variant="success">{$_('settings.saved')}</Alert>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="mt-8 space-y-6">
    <Input id="name" label={$_('settings.org_name')} bind:value={name} required />

    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="brandColor" class="block text-sm font-medium text-slate-700">{$_('settings.brand_color')}</label>
        <div class="mt-1 flex items-center gap-2">
          <input id="brandColor" type="color" bind:value={brandColor} class="h-10 w-10 rounded border border-slate-300 cursor-pointer" />
          <input type="text" bind:value={brandColor} class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors" />
        </div>
      </div>
      <Input id="defaultLocale" label={$_('settings.default_locale')} bind:value={defaultLocale} />
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
