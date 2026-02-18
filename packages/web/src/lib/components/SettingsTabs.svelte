<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { getPath } from '../router.svelte.ts'
  import { currentOrg, type Organization } from '../stores/org'

  let org = $state<Organization | null>(null)
  currentOrg.subscribe((v) => (org = v))

  let base = $derived(`/${org?.id ?? ''}/settings`)

  let tabs = $derived([
    { href: base, label: $_('settings_tabs.general'), match: base },
    { href: `${base}/widget`, label: $_('settings_tabs.widget'), match: `${base}/widget` },
    { href: `${base}/widget/demo`, label: $_('settings_tabs.widget_demo'), match: `${base}/widget/demo` },
    { href: `${base}/integrations`, label: $_('settings_tabs.integrations'), match: `${base}/integrations` },
  ])

  let activePath = $derived(getPath())

  /** Match longer paths first so /widget/demo doesn't highlight /widget */
  function isActive(tab: (typeof tabs)[number]): boolean {
    if (tab.match === base) return activePath === base
    return activePath.startsWith(tab.match)
  }
</script>

<nav class="flex gap-1 border-b border-slate-200 mb-8">
  {#each tabs as tab}
    <a
      href={tab.href}
      class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px {isActive(tab)
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
    >
      {tab.label}
    </a>
  {/each}
</nav>
