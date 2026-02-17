<!--
  Unified button/link — renders <a> when `href` is set, <button> otherwise.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
  type Size = 'sm' | 'md'

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    href,
    type = 'button',
    onclick,
    children,
  }: {
    variant?: Variant
    size?: Size
    disabled?: boolean
    loading?: boolean
    href?: string
    type?: 'button' | 'submit'
    onclick?: (e: Event) => void
    children: Snippet
  } = $props()

  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<Variant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'text-gray-600 hover:text-gray-800',
    danger: 'text-red-600 hover:text-red-800',
    ghost: 'text-sm text-gray-600 hover:text-gray-800',
  }

  const sizes: Record<Size, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
  }

  let classes = $derived(`${base} ${variants[variant]} ${sizes[size]}`)
</script>

{#if href}
  <a {href} class={classes}>{@render children()}</a>
{:else}
  <button {type} disabled={disabled || loading} {onclick} class={classes}>
    {@render children()}
  </button>
{/if}
