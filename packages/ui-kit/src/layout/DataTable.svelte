<!--
  Styled table wrapper with header row and slot-based body.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    columns,
    children,
  }: {
    columns: Array<{ label: string; align?: 'left' | 'right' }>
    children: Snippet
  } = $props()
</script>

<div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
  <table class="min-w-full divide-y divide-slate-200">
    <thead class="bg-slate-50">
      <tr>
        {#each columns as col}
          <th class="px-6 py-3 text-xs font-medium text-slate-600 {col.align === 'right' ? 'text-right' : 'text-left'}">
            {col.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      {@render children()}
    </tbody>
  </table>
</div>
