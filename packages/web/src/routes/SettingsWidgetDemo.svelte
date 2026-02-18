<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { PageHeader } from '@heedback/ui-kit'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'
  import { currentOrg } from '../lib/stores/org'

  let { orgId }: { orgId: string } = $props()

  let origin = window.location.origin
  let widgetColor = $state('')

  currentOrg.subscribe((org) => {
    if (org) {
      const settings = org.settings as Record<string, unknown>
      widgetColor = (settings?.widgetColor as string) || (settings?.brandColor as string) || ''
    }
  })

  /** data-color attr to forward the saved widget color into the iframe */
  let colorAttr = $derived(widgetColor ? ` data-color="${widgetColor}"` : '')

  /** Mock website HTML that loads the real widget via the Vite dev server */
  let srcdoc = $derived(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background: #f8fafc; }
    header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
    header h1 { font-size: 18px; font-weight: 600; }
    header nav { display: flex; gap: 24px; }
    header nav a { text-decoration: none; color: #64748b; font-size: 14px; }
    header nav a:hover { color: #334155; }
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

  <script src="${origin}/widget.js" data-org="${orgId}" data-position="bottom-right"${colorAttr}><\/script>
</body>
</html>`)
</script>

<div>
  <SettingsTabs />
  <PageHeader title={$_('settings_widget.demo_title')} subtitle={$_('settings_widget.demo_subtitle')} />

  <iframe
    title="Widget demo"
    {srcdoc}
    class="mt-4 w-full rounded-lg border border-slate-200 shadow-sm"
    style="height: calc(100vh - 220px);"
  ></iframe>
</div>
