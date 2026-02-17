<!--
  Surface card — optionally interactive (hover border highlight).
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
    `bg-white rounded-xl border border-gray-200 ${paddings[padding]}` +
    (interactive ? ' hover:border-indigo-300 transition-colors' : ''),
  )
</script>

{#if href}
  <a {href} class="block {classes}">{@render children()}</a>
{:else}
  <div class={classes}>{@render children()}</div>
{/if}
