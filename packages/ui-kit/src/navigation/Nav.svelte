<!--
  Sidebar navigation list — renders NavItem for each entry.
-->
<script lang="ts">
  import NavItem from './NavItem.svelte'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  let {
    items,
    activePath,
  }: {
    items: Array<{ href: string; label: string; icon: IconComponent }>
    activePath: string
  } = $props()

  function isActive(href: string): boolean {
    if (activePath === href) return true
    // Sub-path match (e.g. /org/articles matches /org/articles/new)
    return activePath.startsWith(href + '/')
  }
</script>

<nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
  {#each items as item}
    <NavItem
      href={item.href}
      label={item.label}
      icon={item.icon}
      active={isActive(item.href)}
    />
  {/each}
</nav>
