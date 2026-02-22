<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Copy, Check } from 'lucide-svelte'
  import { Button, Input, PageHeader } from '@heedback/ui-kit'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'
  import { currentOrg } from '../lib/stores/org'
  import { api } from '../lib/api/client'
  import { addToast } from '../lib/stores/toast'

  let { orgId }: { orgId: string } = $props()

  let webhookUrl = $state('')
  let slackWebhookUrl = $state('')
  let openaiApiKey = $state('')
  let anthropicApiKey = $state('')
  let gitProductionBranch = $state('main')
  let gitWebhookSecret = $state('')
  let saving = $state(false)
  let copiedUrl = $state(false)
  let copiedSecret = $state(false)

  // Store masked versions to detect user edits on save
  let openaiMasked = ''
  let anthropicMasked = ''

  const MASK = '••••••••'

  let gitWebhookUrl = $derived(`${window.location.origin}/api/v1/webhooks/git/${orgId}`)

  function maskApiKey(key: string): string {
    if (!key) return ''
    const prefix = key.startsWith('sk-ant-') ? 'sk-ant-' : key.substring(0, 3)
    return `${prefix}${MASK}${key.slice(-4)}`
  }

  async function copyToClipboard(text: string, field: 'url' | 'secret') {
    await navigator.clipboard.writeText(text)
    if (field === 'url') {
      copiedUrl = true
      setTimeout(() => (copiedUrl = false), 2000)
    } else {
      copiedSecret = true
      setTimeout(() => (copiedSecret = false), 2000)
    }
  }

  currentOrg.subscribe((org) => {
    if (org) {
      const settings = org.settings as Record<string, unknown>
      webhookUrl = (settings?.webhookUrl as string) || ''
      slackWebhookUrl = (settings?.slackWebhookUrl as string) || ''
      openaiMasked = maskApiKey((settings?.openaiApiKey as string) || '')
      anthropicMasked = maskApiKey((settings?.anthropicApiKey as string) || '')
      openaiApiKey = openaiMasked
      anthropicApiKey = anthropicMasked
      gitProductionBranch = (settings?.gitProductionBranch as string) || 'main'
      gitWebhookSecret = (settings?.gitWebhookSecret as string) || ''
    }
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    try {
      const settings: Record<string, string | null> = {
        webhookUrl: webhookUrl || null,
        slackWebhookUrl: slackWebhookUrl || null,
        gitProductionBranch: gitProductionBranch || 'main',
      }
      // Only send keys the user actually changed — not the masked placeholder
      if (openaiApiKey !== openaiMasked) settings.openaiApiKey = openaiApiKey || null
      if (anthropicApiKey !== anthropicMasked) settings.anthropicApiKey = anthropicApiKey || null

      const res = await api.put<{ data: { settings: Record<string, unknown> } }>(
        `/organizations/${orgId}`,
        { settings },
      )

      // Refresh secret from response (auto-generated on first save)
      const newSettings = res.data?.settings as Record<string, unknown> | undefined
      if (newSettings?.gitWebhookSecret) {
        gitWebhookSecret = newSettings.gitWebhookSecret as string
      }

      addToast($_('success.saved'), 'success')
    } finally {
      saving = false
    }
  }
</script>

<div class="max-w-2xl">
  <SettingsTabs />
  <PageHeader
    title={$_('settings_integrations.title')}
    subtitle={$_('settings_integrations.subtitle')}
  />

  <form onsubmit={handleSubmit} class="mt-8 space-y-8">
    <!-- Generic Webhook -->
    <section>
      <h2 class="text-lg font-semibold text-slate-900">{$_('settings_integrations.webhook_title')}</h2>
      <p class="mt-1 text-sm text-slate-600">{$_('settings_integrations.webhook_desc')}</p>
      <div class="mt-4">
        <Input
          id="webhookUrl"
          label={$_('settings_integrations.webhook_url')}
          placeholder="https://example.com/webhook"
          bind:value={webhookUrl}
          help={$_('settings_integrations.webhook_url_hint')}
        />
      </div>
    </section>

    <!-- Slack Integration -->
    <section>
      <h2 class="text-lg font-semibold text-slate-900">{$_('settings_integrations.slack_title')}</h2>
      <p class="mt-1 text-sm text-slate-600">{$_('settings_integrations.slack_desc')}</p>
      <div class="mt-4">
        <Input
          id="slackWebhookUrl"
          label={$_('settings_integrations.slack_webhook_url')}
          placeholder="https://hooks.slack.com/services/..."
          bind:value={slackWebhookUrl}
          help={$_('settings_integrations.slack_webhook_url_hint')}
        />
      </div>
    </section>

    <!-- Git Integration -->
    <section>
      <h2 class="text-lg font-semibold text-slate-900">{$_('settings_integrations.git_title')}</h2>
      <p class="mt-1 text-sm text-slate-600">{$_('settings_integrations.git_desc')}</p>
      <div class="mt-4 space-y-4">
        <div>
          <label for="gitWebhookUrl" class="block text-sm font-medium text-slate-700">
            {$_('settings_integrations.git_webhook_url')}
          </label>
          <div class="mt-1 flex gap-2">
            <input
              id="gitWebhookUrl"
              type="text"
              readonly
              value={gitWebhookUrl}
              class="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            <button
              type="button"
              onclick={() => copyToClipboard(gitWebhookUrl, 'url')}
              class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              {#if copiedUrl}
                <Check class="h-4 w-4 text-green-600" />
              {:else}
                <Copy class="h-4 w-4" />
              {/if}
            </button>
          </div>
          <p class="mt-1 text-xs text-slate-500">{$_('settings_integrations.git_webhook_url_hint')}</p>
        </div>

        {#if gitWebhookSecret}
          <div>
            <label for="gitWebhookSecret" class="block text-sm font-medium text-slate-700">
              {$_('settings_integrations.git_webhook_secret')}
            </label>
            <div class="mt-1 flex gap-2">
              <input
                id="gitWebhookSecret"
                type="text"
                readonly
                value={gitWebhookSecret}
                class="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700"
              />
              <button
                type="button"
                onclick={() => copyToClipboard(gitWebhookSecret, 'secret')}
                class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {#if copiedSecret}
                  <Check class="h-4 w-4 text-green-600" />
                {:else}
                  <Copy class="h-4 w-4" />
                {/if}
              </button>
            </div>
            <p class="mt-1 text-xs text-slate-500">{$_('settings_integrations.git_webhook_secret_hint')}</p>
          </div>
        {/if}

        <Input
          id="gitProductionBranch"
          label={$_('settings_integrations.git_production_branch')}
          placeholder="main"
          bind:value={gitProductionBranch}
          help={$_('settings_integrations.git_production_branch_hint')}
        />

        <!-- Setup guide -->
        <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 class="text-sm font-medium text-slate-800">{$_('settings_integrations.git_setup_title')}</h3>
          <ol class="mt-2 space-y-1 text-xs text-slate-600">
            {#if !gitWebhookSecret}
              <li>{$_('settings_integrations.git_setup_step1')}</li>
            {:else}
              <li>{$_('settings_integrations.git_setup_step2')}</li>
              <li>{@html $_('settings_integrations.git_setup_step3_github')}</li>
              <li>{@html $_('settings_integrations.git_setup_step3_gitlab')}</li>
              <li>{$_('settings_integrations.git_setup_step4')}</li>
            {/if}
          </ol>
        </div>
      </div>
    </section>

    <!-- AI Configuration -->
    <section>
      <h2 class="text-lg font-semibold text-slate-900">{$_('settings_integrations.ai_title')}</h2>
      <p class="mt-1 text-sm text-slate-600">{$_('settings_integrations.ai_description')}</p>
      <div class="mt-4 space-y-4">
        <Input
          id="openaiApiKey"
          type="password"
          label={$_('settings_integrations.openai_api_key')}
          placeholder="sk-..."
          bind:value={openaiApiKey}
        />
        <Input
          id="anthropicApiKey"
          type="password"
          label={$_('settings_integrations.anthropic_api_key')}
          placeholder="sk-ant-..."
          bind:value={anthropicApiKey}
        />
      </div>
    </section>

    <Button type="submit" loading={saving}>
      {saving ? $_('common.saving') : $_('settings_integrations.save')}
    </Button>
  </form>
</div>
