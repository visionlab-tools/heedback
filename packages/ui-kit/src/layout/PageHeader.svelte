<!--
  Page header with title, subtitle, and optional action slot.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    subtitle,
    actions,
  }: {
    title: string
    subtitle?: string
    actions?: Snippet
  } = $props()
</script>

<div class="flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
    {#if subtitle}
      <p class="mt-1 text-sm text-gray-500">{subtitle}</p>
    {/if}
  </div>
  {#if actions}
    {@render actions()}
  {/if}
</div>
