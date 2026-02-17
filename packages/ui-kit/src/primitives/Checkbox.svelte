<!--
  Labeled checkbox, consistent with the app styling.
-->
<script lang="ts">
  let {
    label,
    checked = $bindable(false),
  }: {
    label: string
    checked?: boolean
  } = $props()
</script>

<label class="flex items-center gap-3">
  <input type="checkbox" bind:checked class="rounded border-slate-300" />
  <span class="text-sm text-slate-700">{label}</span>
</label>
