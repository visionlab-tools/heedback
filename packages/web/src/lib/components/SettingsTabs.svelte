<script lang="ts">
  import { getPath } from '../router.svelte.ts'

  const tabs = [
    { href: '/settings', label: 'General' },
    { href: '/settings/widget', label: 'Widget Integration' },
  ]

  let activePath = $derived(getPath())
</script>

<nav class="flex gap-1 border-b border-gray-200 mb-8">
  {#each tabs as tab}
    <a
      href={tab.href}
      class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px {activePath === tab.href
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
    >
      {tab.label}
    </a>
  {/each}
</nav>
