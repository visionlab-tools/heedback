<!--
  Text input with label, consistent styling across the app.
-->
<script lang="ts">
  let {
    label,
    type = 'text',
    value = $bindable(''),
    placeholder,
    required = false,
    id,
    help,
    error,
  }: {
    label?: string
    type?: string
    value?: string
    placeholder?: string
    required?: boolean
    id?: string
    help?: string
    error?: string
  } = $props()
</script>

<div>
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
  {/if}
  <input
    {id}
    {type}
    {required}
    {placeholder}
    bind:value
    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  />
  {#if error}<p class="mt-1 text-sm text-red-600">{error}</p>{/if}
  {#if help}<p class="mt-1 text-sm text-gray-500">{help}</p>{/if}
</div>
