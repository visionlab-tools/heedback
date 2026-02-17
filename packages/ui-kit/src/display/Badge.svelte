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
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  }
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {variants[variant]}">
  {@render children()}
</span>
