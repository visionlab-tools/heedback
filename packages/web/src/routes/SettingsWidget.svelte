<script lang="ts">
  import { PageHeader } from '@heedback/ui-kit'
  import { currentOrg } from '../lib/stores/org'
  import CodeSnippet from '../lib/components/CodeSnippet.svelte'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'

  let orgSlug = $state('')
  let brandColor = $state('#6366f1')
  let apiBaseUrl = $state(window.location.origin)

  currentOrg.subscribe((org) => {
    if (!org) return
    orgSlug = org.slug
    const settings = org.settings as Record<string, unknown>
    brandColor = (settings?.brandColor as string) || '#6366f1'
  })

  let autoInitSnippet = $derived(
    `<script
  src="${apiBaseUrl}/widget.js"
  data-org="${orgSlug}"
  data-color="${brandColor}"
  data-position="bottom-right"
  data-locale="en"><\/script>`,
  )

  let manualSnippet = $derived(
    `<script src="${apiBaseUrl}/widget.js"><\/script>
<script>
  window.Heedback.init({
    org: '${orgSlug}',
    color: '${brandColor}',
    position: 'bottom-right',
    locale: 'en'
  })

  // Optional: identify logged-in users
  window.Heedback.identify({
    id: 'user-id',
    email: 'user@example.com',
    name: 'Jane Doe'
  })
<\/script>`,
  )
</script>

<div class="max-w-3xl">
  <SettingsTabs />
  <PageHeader title="Widget Integration" subtitle="Add the Heedback chat widget to your website in minutes." />

  <!-- Quick start -->
  <section class="mt-8">
    <h2 class="text-lg font-semibold text-gray-900">Quick Start</h2>
    <p class="mt-1 text-sm text-gray-600">
      Paste this snippet before the closing <code class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">&lt;/body&gt;</code> tag of your website.
    </p>
    <div class="mt-4">
      <CodeSnippet code={autoInitSnippet} />
    </div>
  </section>

  <!-- Configuration -->
  <section class="mt-10">
    <h2 class="text-lg font-semibold text-gray-900">Configuration Options</h2>
    <div class="mt-4 overflow-hidden rounded-lg border border-gray-200">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2.5 text-left font-medium text-gray-700">Attribute</th>
            <th class="px-4 py-2.5 text-left font-medium text-gray-700">Default</th>
            <th class="px-4 py-2.5 text-left font-medium text-gray-700">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-org</td>
            <td class="px-4 py-2.5 text-gray-500">—</td>
            <td class="px-4 py-2.5 text-gray-700">Your organization slug (required)</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-color</td>
            <td class="px-4 py-2.5 font-mono text-xs text-gray-500">#6366f1</td>
            <td class="px-4 py-2.5 text-gray-700">Brand color for the widget header</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-position</td>
            <td class="px-4 py-2.5 font-mono text-xs text-gray-500">bottom-right</td>
            <td class="px-4 py-2.5 text-gray-700">Widget position: bottom-right or bottom-left</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-locale</td>
            <td class="px-4 py-2.5 font-mono text-xs text-gray-500">en</td>
            <td class="px-4 py-2.5 text-gray-700">Default language locale</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-id</td>
            <td class="px-4 py-2.5 text-gray-500">—</td>
            <td class="px-4 py-2.5 text-gray-700">Pre-identify a logged-in user</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-email</td>
            <td class="px-4 py-2.5 text-gray-500">—</td>
            <td class="px-4 py-2.5 text-gray-700">User email for identification</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">data-user-name</td>
            <td class="px-4 py-2.5 text-gray-500">—</td>
            <td class="px-4 py-2.5 text-gray-700">User display name</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Advanced: Manual API -->
  <section class="mt-10">
    <h2 class="text-lg font-semibold text-gray-900">Advanced: JavaScript API</h2>
    <p class="mt-1 text-sm text-gray-600">
      For full control, use the JavaScript API to initialize, identify users, and toggle the widget programmatically.
    </p>
    <div class="mt-4">
      <CodeSnippet code={manualSnippet} language="javascript" />
    </div>
  </section>

  <!-- API methods -->
  <section class="mt-10 mb-8">
    <h2 class="text-lg font-semibold text-gray-900">API Methods</h2>
    <div class="mt-4 overflow-hidden rounded-lg border border-gray-200">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2.5 text-left font-medium text-gray-700">Method</th>
            <th class="px-4 py-2.5 text-left font-medium text-gray-700">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.init(config)</td>
            <td class="px-4 py-2.5 text-gray-700">Initialize the widget with configuration</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.identify(user)</td>
            <td class="px-4 py-2.5 text-gray-700">Identify a logged-in user</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.open()</td>
            <td class="px-4 py-2.5 text-gray-700">Open the widget panel</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.close()</td>
            <td class="px-4 py-2.5 text-gray-700">Close the widget panel</td>
          </tr>
          <tr>
            <td class="px-4 py-2.5 font-mono text-xs text-indigo-600">Heedback.destroy()</td>
            <td class="px-4 py-2.5 text-gray-700">Remove the widget from the page</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>
