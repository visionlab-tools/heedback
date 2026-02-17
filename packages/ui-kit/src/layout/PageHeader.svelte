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

<div class="flex items-center justify-between mb-8">
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">{title}</h1>
    {#if subtitle}
      <p class="text-sm text-slate-500 mt-1">{subtitle}</p>
    {/if}
  </div>
  {#if actions}
    {@render actions()}
  {/if}
</div>
