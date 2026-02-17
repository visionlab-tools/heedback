<script lang="ts">
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
  <h1 class="text-2xl font-bold text-gray-900">General Settings</h1>
  <p class="mt-1 text-sm text-gray-500">Configure your organization settings.</p>

  {#if success}
    <div class="mt-4">
      <Alert variant="success">Settings saved.</Alert>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="mt-8 space-y-6">
    <Input id="name" label="Organization Name" bind:value={name} required />

    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="brandColor" class="block text-sm font-medium text-gray-700">Brand Color</label>
        <div class="mt-1 flex items-center gap-2">
          <input id="brandColor" type="color" bind:value={brandColor} class="h-10 w-10 rounded border border-gray-300 cursor-pointer" />
          <input type="text" bind:value={brandColor} class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <Input id="defaultLocale" label="Default Locale" bind:value={defaultLocale} />
    </div>

    <div class="space-y-3">
      <Checkbox label="Enable Help Center" bind:checked={helpCenterEnabled} />
      <Checkbox label="Enable Feedback Board" bind:checked={feedbackEnabled} />
      <Checkbox label="Require authentication on portal" bind:checked={portalAuthRequired} />
    </div>

    <Button type="submit" loading={saving}>
      {saving ? 'Saving...' : 'Save Settings'}
    </Button>
  </form>
</div>
