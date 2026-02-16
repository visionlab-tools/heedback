<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

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
  <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
  <p class="mt-1 text-sm text-gray-500">Configure your organization settings.</p>

  {#if success}
    <div class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
      Settings saved.
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="mt-8 space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Organization Name</label>
      <input id="name" type="text" bind:value={name} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="brandColor" class="block text-sm font-medium text-gray-700">Brand Color</label>
        <div class="mt-1 flex items-center gap-2">
          <input id="brandColor" type="color" bind:value={brandColor} class="h-10 w-10 rounded border border-gray-300 cursor-pointer" />
          <input type="text" bind:value={brandColor} class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div>
        <label for="defaultLocale" class="block text-sm font-medium text-gray-700">Default Locale</label>
        <input id="defaultLocale" type="text" bind:value={defaultLocale} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>

    <div class="space-y-3">
      <label class="flex items-center gap-3">
        <input type="checkbox" bind:checked={helpCenterEnabled} class="rounded border-gray-300" />
        <span class="text-sm text-gray-700">Enable Help Center</span>
      </label>
      <label class="flex items-center gap-3">
        <input type="checkbox" bind:checked={feedbackEnabled} class="rounded border-gray-300" />
        <span class="text-sm text-gray-700">Enable Feedback Board</span>
      </label>
      <label class="flex items-center gap-3">
        <input type="checkbox" bind:checked={portalAuthRequired} class="rounded border-gray-300" />
        <span class="text-sm text-gray-700">Require authentication on portal</span>
      </label>
    </div>

    <button type="submit" disabled={saving} class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
      {saving ? 'Saving...' : 'Save Settings'}
    </button>
  </form>
</div>
