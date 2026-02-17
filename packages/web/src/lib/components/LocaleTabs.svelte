<!--
  Reusable locale tab switcher for multi-locale content editing.
-->
<script lang="ts">
  let {
    locales,
    active,
    onchange,
  }: {
    locales: string[]
    active: string
    onchange: (locale: string) => void
  } = $props()
</script>

<div class="flex gap-1 border-b border-slate-200 mb-6">
  {#each locales as loc}
    <button
      type="button"
      onclick={() => onchange(loc)}
      class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
        {active === loc
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-slate-500 hover:text-slate-700'}"
    >
      {loc.toUpperCase()}
    </button>
  {/each}
</div>
