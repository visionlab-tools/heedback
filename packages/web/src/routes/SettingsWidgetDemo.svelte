<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { PageHeader, ColorPicker, Input } from '@heedback/ui-kit'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'
  import { currentOrg } from '../lib/stores/org'

  let { orgId }: { orgId: string } = $props()

  let origin = window.location.origin

  // Live-editable demo parameters
  let demoColor = $state('#6366f1')
  let demoPosition = $state('bottom-right')
  let demoLocale = $state('en')

  // User identity fields for testing
  let userFirstName = $state('')
  let userLastName = $state('')
  let userAvatarUrl = $state('')

  currentOrg.subscribe((org) => {
    if (org) {
      const settings = org.settings as Record<string, unknown>
      demoColor = (settings?.widgetColor as string)
        || (settings?.brandColor as string)
        || '#6366f1'
    }
  })

  let colorAttr = $derived(demoColor ? ` data-color="${demoColor}"` : '')

  let userAttrs = $derived(buildUserAttrs(userFirstName, userLastName, userAvatarUrl))

  function buildUserAttrs(firstName: string, lastName: string, avatarUrl: string): string {
    if (!firstName.trim()) return ''
    let attrs = ` data-user-id="demo-user-1" data-user-first-name="${firstName.trim()}"`
    if (lastName.trim()) attrs += ` data-user-last-name="${lastName.trim()}"`
    if (avatarUrl.trim()) attrs += ` data-user-avatar-url="${avatarUrl.trim()}"`
    return attrs
  }

  /** Rebuild the iframe HTML whenever a parameter changes */
  let srcdoc = $derived(buildSrcdoc(demoPosition, demoLocale, colorAttr, userAttrs))

  function buildSrcdoc(position: string, locale: string, colorAttribute: string, userAttributes: string) {
    return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background: #f8fafc; pointer-events: none; }
    /* Only the widget (fixed positioned) is interactive */
    .hb-root, .hb-root * { pointer-events: auto !important; }
    header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
    header h1 { font-size: 18px; font-weight: 600; }
    header nav { display: flex; gap: 24px; }
    header nav a { text-decoration: none; color: #64748b; font-size: 14px; }
    .hero { max-width: 640px; margin: 80px auto; text-align: center; padding: 0 24px; }
    .hero h2 { font-size: 32px; font-weight: 700; line-height: 1.2; }
    .hero p { margin-top: 16px; color: #64748b; font-size: 16px; line-height: 1.6; }
    .cta { display: inline-block; margin-top: 24px; padding: 10px 24px; background: #4f46e5; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 800px; margin: 64px auto; padding: 0 24px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .card h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .card p { font-size: 13px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <header>
    <h1>Acme Inc.</h1>
    <nav>
      <a href="#">Products</a>
      <a href="#">Pricing</a>
      <a href="#">Docs</a>
      <a href="#">Blog</a>
    </nav>
  </header>

  <div class="hero">
    <h2>Build better products with real-time feedback</h2>
    <p>Acme helps teams collect, organize, and act on customer feedback — all in one place.</p>
    <a href="#" class="cta">Get started free</a>
  </div>

  <div class="cards">
    <div class="card">
      <h3>Collect feedback</h3>
      <p>Gather insights from your users through an embeddable widget and public portal.</p>
    </div>
    <div class="card">
      <h3>Prioritize roadmap</h3>
      <p>Let your users vote so you always know what to build next.</p>
    </div>
    <div class="card">
      <h3>Close the loop</h3>
      <p>Keep customers in the loop with changelogs and status updates.</p>
    </div>
  </div>

  <script src="${origin}/widget.js" data-org="${orgId}" data-position="${position}" data-locale="${locale}"${colorAttribute}${userAttributes}><\/script>
</body>
</html>`
  }
</script>

<div>
  <SettingsTabs />
  <PageHeader title={$_('settings_widget.demo_title')} subtitle={$_('settings_widget.demo_subtitle')} />

  <!-- Live controls -->
  <div class="mt-4 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div class="w-48">
      <label for="demoPosition" class="block text-xs font-medium text-slate-600 mb-1">{$_('settings_widget.demo_position')}</label>
      <select
        id="demoPosition"
        bind:value={demoPosition}
        class="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <option value="bottom-right">bottom-right</option>
        <option value="bottom-left">bottom-left</option>
      </select>
    </div>

    <div class="w-40">
      <label for="demoLocale" class="block text-xs font-medium text-slate-600 mb-1">{$_('settings_widget.demo_locale')}</label>
      <select
        id="demoLocale"
        bind:value={demoLocale}
        class="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="nl">Nederlands</option>
        <option value="es">Español</option>
        <option value="de">Deutsch</option>
      </select>
    </div>

    <div class="w-56">
      <ColorPicker label={$_('settings_widget.demo_color')} bind:value={demoColor} />
    </div>
  </div>

  <!-- User identity controls -->
  <div class="mt-3 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div class="w-40">
      <Input label={$_('settings_widget.demo_first_name')} bind:value={userFirstName} placeholder="Jane" />
    </div>
    <div class="w-40">
      <Input label={$_('settings_widget.demo_last_name')} bind:value={userLastName} placeholder="Doe" />
    </div>
    <div class="flex-1 min-w-48">
      <Input label={$_('settings_widget.demo_avatar_url')} bind:value={userAvatarUrl} placeholder="https://..." />
    </div>
  </div>

  <iframe
    title="Widget demo"
    {srcdoc}
    class="mt-4 w-full rounded-lg border border-slate-200 shadow-sm"
    style="height: calc(100vh - 360px);"
  ></iframe>
</div>
