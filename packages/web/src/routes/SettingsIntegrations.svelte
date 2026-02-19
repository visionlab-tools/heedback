<script lang="ts">
  import { _ } from 'svelte-i18n'
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
  let saving = $state(false)

  // Store masked versions to detect user edits on save
  let openaiMasked = ''
  let anthropicMasked = ''

  const MASK = '••••••••'

  function maskApiKey(key: string): string {
    if (!key) return ''
    const prefix = key.startsWith('sk-ant-') ? 'sk-ant-' : key.substring(0, 3)
    return `${prefix}${MASK}${key.slice(-4)}`
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
    }
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    try {
      const settings: Record<string, string | null> = {
        webhookUrl: webhookUrl || null,
        slackWebhookUrl: slackWebhookUrl || null,
      }
      // Only send keys the user actually changed — not the masked placeholder
      if (openaiApiKey !== openaiMasked) settings.openaiApiKey = openaiApiKey || null
      if (anthropicApiKey !== anthropicMasked) settings.anthropicApiKey = anthropicApiKey || null

      await api.put(`/organizations/${orgId}`, { settings })
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
