<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { getPath } from '../router.svelte.ts'
  import { currentOrg, type Organization } from '../stores/org'

  let org = $state<Organization | null>(null)
  currentOrg.subscribe((v) => (org = v))

  let tabs = $derived([
    { href: `/${org?.slug ?? ''}/settings`, label: $_('settings_tabs.general') },
    { href: `/${org?.slug ?? ''}/settings/widget`, label: $_('settings_tabs.widget') },
  ])

  let activePath = $derived(getPath())
</script>

<nav class="flex gap-1 border-b border-slate-200 mb-8">
  {#each tabs as tab}
    <a
      href={tab.href}
      class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px {activePath === tab.href
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
    >
      {tab.label}
    </a>
  {/each}
</nav>
