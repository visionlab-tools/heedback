<!--
  Dropdown select with label, consistent styling.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    value = $bindable(''),
    id,
    onchange,
    children,
  }: {
    label?: string
    value?: string
    id?: string
    onchange?: () => void
    children: Snippet
  } = $props()
</script>

<div>
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
  {/if}
  <select
    {id}
    bind:value
    {onchange}
    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  >
    {@render children()}
  </select>
</div>
