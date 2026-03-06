<!--
  Single sidebar navigation link with active state indicator.
  Lucide icons use SvelteComponentTyped (Svelte 4 class API), so we
  use a permissive constructor type for compatibility.
-->
<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  let {
    href,
    label,
    icon: Icon,
    active,
    badge = 0,
  }: {
    href: string
    label: string
    icon: IconComponent
    active: boolean
    badge?: number
  } = $props()
</script>

<a
  {href}
  class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
    {active
      ? 'bg-white/10 text-white'
      : 'text-slate-400 hover:bg-white/10 hover:text-white'}"
>
  <Icon size={18} strokeWidth={active ? 2 : 1.5} />
  <span class="flex-1">{label}</span>
  {#if badge > 0}
    <span class="min-w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-semibold px-1.5">
      {badge > 99 ? '99+' : badge}
    </span>
  {/if}
</a>
