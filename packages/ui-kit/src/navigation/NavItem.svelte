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
  }: {
    href: string
    label: string
    icon: IconComponent
    active: boolean
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
  <span>{label}</span>
</a>
