<!--
  Multiline text input with label, consistent styling.
-->
<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements'

  let {
    label,
    value = $bindable(''),
    rows = 3,
    placeholder,
    required = false,
    id,
    help,
    mono = false,
    ...rest
  }: {
    label?: string
    value?: string
    rows?: number
    placeholder?: string
    required?: boolean
    id?: string
    help?: string
    mono?: boolean
  } & HTMLTextareaAttributes = $props()
</script>

<div>
  {#if label}
    <label for={id} class="block text-sm font-medium text-slate-700">{label}</label>
  {/if}
  <textarea
    {id}
    {rows}
    {required}
    {placeholder}
    bind:value
    {...rest}
    class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors {mono ? 'font-mono text-sm' : ''}"
  ></textarea>
  {#if help}<p class="mt-1 text-sm text-slate-500">{help}</p>{/if}
</div>
