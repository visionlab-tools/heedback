<!--
  Surface card — optionally interactive (hover shadow).
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    padding = 'md',
    interactive = false,
    href,
    children,
  }: {
    padding?: 'sm' | 'md'
    interactive?: boolean
    href?: string
    children: Snippet
  } = $props()

  const paddings = { sm: 'p-4', md: 'p-6' }

  let classes = $derived(
    `bg-white rounded-lg border border-slate-200 shadow-sm ${paddings[padding]}` +
    (interactive ? ' hover:shadow-md transition-shadow' : ''),
  )
</script>

{#if href}
  <a {href} class="block {classes}">{@render children()}</a>
{:else}
  <div class={classes}>{@render children()}</div>
{/if}
