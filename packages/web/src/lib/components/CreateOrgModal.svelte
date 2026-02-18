<!--
  Modal to create an organization.
  Used as blocking onboarding (no org yet) or dismissible (add another org).
-->
<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Modal, Button, TitleWithSlug, Select } from '@heedback/ui-kit'
  import { LOCALE_LABELS } from '@heedback/shared'
  import { api } from '../api/client'
  import { currentOrg } from '../stores/org'
  import { addToast } from '../stores/toast'
  import { navigate } from '../router.svelte.ts'

  let {
    blocking = true,
    onclose,
  }: {
    blocking?: boolean
    onclose?: () => void
  } = $props()

  let name = $state('')
  let slug = $state('')
  let brandColor = $state('#6366f1')
  let defaultLocale = $state('en')
  let logoFile = $state<File | null>(null)
  let logoPreview = $state<string | null>(null)
  let creating = $state(false)

  let fileInput: HTMLInputElement

  const localeEntries = Object.entries(LOCALE_LABELS)

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    logoFile = file
    logoPreview = URL.createObjectURL(file)
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!name || !slug) return
    creating = true

    try {
      let logoUrl: string | null = null
      if (logoFile) {
        const result = await api.upload(logoFile)
        logoUrl = result.key
      }

      await api.post('/organizations', {
        name,
        slug,
        logoUrl,
        settings: {
          brandColor,
          defaultLocale,
          supportedLocales: [defaultLocale],
        },
      })

      await currentOrg.load()
      addToast($_('success.created'), 'success')
      onclose?.()
      navigate(`/${slug}`)
    } finally {
      creating = false
    }
  }
</script>

<Modal open {blocking} {onclose} title={$_('create_org.title')}>
  <p class="text-sm text-slate-500 mb-6">{$_('create_org.subtitle')}</p>

  <form onsubmit={handleSubmit} class="space-y-5">
    <TitleWithSlug
      bind:title={name}
      bind:slug
      titleLabel={$_('create_org.name')}
      slugPrefix="/"
      required
    />

    <!-- Brand color -->
    <div>
      <label for="brandColor" class="block text-sm font-medium text-slate-700">
        {$_('create_org.color')}
      </label>
      <div class="mt-1 flex items-center gap-2">
        <input
          id="brandColor"
          type="color"
          bind:value={brandColor}
          class="h-10 w-10 rounded border border-slate-300 cursor-pointer"
        />
        <input
          type="text"
          bind:value={brandColor}
          class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors"
        />
      </div>
    </div>

    <!-- Default language -->
    <Select id="defaultLocale" label={$_('create_org.locale')} bind:value={defaultLocale}>
      {#each localeEntries as [code, label]}
        <option value={code}>{label} ({code})</option>
      {/each}
    </Select>

    <!-- Logo upload -->
    <div>
      <label for="logoUpload" class="block text-sm font-medium text-slate-700">{$_('create_org.logo')}</label>
      <p class="text-xs text-slate-400 mt-0.5">{$_('create_org.logo_hint')}</p>
      <button
        type="button"
        onclick={() => fileInput.click()}
        class="mt-2 flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors overflow-hidden"
      >
        {#if logoPreview}
          <img src={logoPreview} alt="Logo" class="w-full h-full object-cover" />
        {:else}
          <span class="text-2xl text-slate-300">+</span>
        {/if}
      </button>
      <input
        id="logoUpload"
        bind:this={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
        class="hidden"
        onchange={handleFileChange}
      />
    </div>

    <Button type="submit" loading={creating} fullWidth>
      {creating ? $_('create_org.creating') : $_('create_org.submit')}
    </Button>
  </form>
</Modal>
