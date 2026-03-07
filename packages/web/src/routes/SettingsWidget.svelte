<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button, PageHeader, ColorPicker } from '@heedback/ui-kit'
  import CodeSnippet from '../lib/components/CodeSnippet.svelte'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'
  import { currentOrg } from '../lib/stores/org'
  import { api } from '../lib/api/client'
  import { addToast } from '../lib/stores/toast'

  let { orgId }: { orgId: string } = $props()

  let widgetBaseUrl = $state(
    (window as any).__CONFIG__?.WIDGET_URL || window.location.origin,
  )
  let apiBaseUrl = (window as any).__CONFIG__?.API_URL || ''
  let widgetColor = $state('#6366f1')
  let saving = $state(false)

  currentOrg.subscribe((org) => {
    if (org) {
      const settings = org.settings as Record<string, unknown>
      widgetColor = (settings?.widgetColor as string) || (settings?.brandColor as string) || '#6366f1'
    }
  })

  async function saveAppearance(e: Event) {
    e.preventDefault()
    saving = true
    try {
      await api.put(`/organizations/${orgId}`, {
        settings: { widgetColor },
      })
      addToast($_('success.saved'), 'success')
    } finally {
      saving = false
    }
  }

  let apiAttr = $derived(apiBaseUrl ? `\n  data-api="${apiBaseUrl}"` : '')

  let colorAttr = $derived(widgetColor ? `\n  data-color="${widgetColor}"` : '')

  let autoInitSnippet = $derived(
    `<script
  src="${widgetBaseUrl}/widget.js"
  data-org="${orgId}"${apiAttr}${colorAttr}
  data-position="bottom-right"
  data-locale="en"><\/script>`,
  )

  let manualSnippet = $derived(
    `<script src="${widgetBaseUrl}/widget.js"><\/script>
<script>
  window.Heedback.init({
    org: '${orgId}',${apiBaseUrl ? `\n    apiUrl: '${apiBaseUrl}',` : ''}${widgetColor ? `\n    color: '${widgetColor}',` : ''}
    position: 'bottom-right',
    locale: 'en'
  })

  // Optional: identify logged-in users
  window.Heedback.identify({
    id: 'user-123',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    position: 'CTO',
    company: 'Acme Inc.',
    pricingPlan: 'pro',
    language: 'en',
    metadata: { plan_id: 42, signup_source: 'referral' }
  })
<\/script>`,
  )
</script>

<div class="max-w-3xl">
  <SettingsTabs />
  <PageHeader title={$_('settings_widget.title')} subtitle={$_('settings_widget.subtitle')} />

  <!-- Widget Appearance -->
  <section>
    <h2 class="text-lg font-semibold text-slate-900">{$_('settings_widget.appearance')}</h2>
    <p class="mt-1 text-sm text-slate-600">{$_('settings_widget.widget_color_hint')}</p>
    <form onsubmit={saveAppearance} class="mt-4 space-y-4">
      <ColorPicker
        id="widgetColor"
        label={$_('settings_widget.widget_color')}
        bind:value={widgetColor}
      />
      <Button type="submit" loading={saving}>
        {saving ? $_('common.saving') : $_('settings_widget.save_appearance')}
      </Button>
    </form>
  </section>

  <!-- Quick start -->
  <section class="mt-10">
    <h2 class="text-lg font-semibold text-slate-900">{$_('settings_widget.quick_start')}</h2>
    <p class="mt-1 text-sm text-slate-600">
      {@html $_('settings_widget.quick_start_desc')}
    </p>
    <div class="mt-4">
      <CodeSnippet code={autoInitSnippet} />
    </div>
  </section>

  <!-- Configuration -->
  <section class="mt-10">
    <h2 class="text-lg font-semibold text-slate-900">{$_('settings_widget.config_options')}</h2>
    <div class="mt-4 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-600">{$_('settings_widget.col_attribute')}</th>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-600">{$_('settings_widget.col_default')}</th>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-600">{$_('settings_widget.col_description')}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-org</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_org_id')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-api</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_api_url')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-position</td>
            <td class="px-4 py-2.5 font-mono text-xs text-slate-500">bottom-right</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_position')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-locale</td>
            <td class="px-4 py-2.5 font-mono text-xs text-slate-500">en</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_locale')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-id</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_id')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-first-name</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_first_name')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-last-name</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_last_name')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-email</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_email')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-position</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_position')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-company</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_company')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-pricing-plan</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_pricing_plan')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-language</td>
            <td class="px-4 py-2.5 text-slate-500">—</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.desc_user_language')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Advanced: Manual API -->
  <section class="mt-10">
    <h2 class="text-lg font-semibold text-slate-900">{$_('settings_widget.advanced')}</h2>
    <p class="mt-1 text-sm text-slate-600">
      {$_('settings_widget.advanced_desc')}
    </p>
    <div class="mt-4">
      <CodeSnippet code={manualSnippet} language="javascript" />
    </div>
  </section>

  <!-- API methods -->
  <section class="mt-10 mb-8">
    <h2 class="text-lg font-semibold text-slate-900">{$_('settings_widget.api_methods')}</h2>
    <div class="mt-4 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-600">{$_('settings_widget.col_method')}</th>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-600">{$_('settings_widget.col_description')}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.init(config)</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.method_init')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.identify(user)</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.method_identify')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.open()</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.method_open')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.close()</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.method_close')}</td>
          </tr>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.destroy()</td>
            <td class="px-4 py-2.5 text-slate-700">{$_('settings_widget.method_destroy')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>
