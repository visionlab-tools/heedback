<!--
  Placeholder shown when a list has no items.
-->
<script lang="ts">
  let {
    message,
  }: {
    message: string
  } = $props()
</script>

<div class="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
  <div class="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
    <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  </div>
  <p class="text-slate-500">{message}</p>
</div>
