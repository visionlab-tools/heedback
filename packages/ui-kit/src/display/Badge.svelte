<!--
  Status/label badge with color variants.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  type Variant = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'purple' | 'orange'

  let {
    variant = 'neutral',
    children,
  }: {
    variant?: Variant
    children: Snippet
  } = $props()

  const variants: Record<Variant, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  }
</script>

<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium {variants[variant]}">
  {@render children()}
</span>
