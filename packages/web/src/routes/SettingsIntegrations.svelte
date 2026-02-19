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
  let saving = $state(false)

  currentOrg.subscribe((org) => {
    if (org) {
      const settings = org.settings as Record<string, unknown>
      webhookUrl = (settings?.webhookUrl as string) || ''
      slackWebhookUrl = (settings?.slackWebhookUrl as string) || ''
    }
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    try {
      await api.put(`/organizations/${orgId}`, {
        settings: {
          webhookUrl: webhookUrl || null,
          slackWebhookUrl: slackWebhookUrl || null,
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

    <Button type="submit" loading={saving}>
      {saving ? $_('common.saving') : $_('settings_integrations.save')}
    </Button>
  </form>
</div>
