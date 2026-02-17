<!--
  Inline alert banner for success/error/warning messages.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  type Variant = 'success' | 'error' | 'warning'

  let {
    variant = 'error',
    children,
  }: {
    variant?: Variant
    children: Snippet
  } = $props()

  const variants: Record<Variant, string> = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }
</script>

<div class="border px-4 py-3 rounded-lg text-sm {variants[variant]}">
  {@render children()}
</div>
