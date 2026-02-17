<!--
  Single sidebar navigation link with active state indicator.
-->
<script lang="ts">
  /* Lucide icons export SvelteComponentTyped (Svelte 4 class API) which
     is runtime-compatible with Svelte 5 but not type-compatible with
     Svelte 5's Component<> type. Using a permissive constructor type. */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  let { href, label, icon: Icon, active }: {
    href: string
    label: string
    icon: IconComponent
    active: boolean
  } = $props()
</script>

<a
  {href}
  class="group relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
    {active
      ? 'bg-white/10 text-white'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}"
>
  {#if active}
    <span class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-400 rounded-r"></span>
  {/if}

  <Icon size={18} strokeWidth={active ? 2 : 1.5} />
  <span>{label}</span>
</a>
