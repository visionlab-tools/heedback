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
    fullWidth = false,
    href,
    type = 'button',
    onclick,
    children,
  }: {
    variant?: Variant
    size?: Size
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
    href?: string
    type?: 'button' | 'submit'
    onclick?: (e: Event) => void
    children: Snippet
  } = $props()

  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<Variant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100 rounded-lg',
  }

  const sizes: Record<Size, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
  }

  let classes = $derived(
    `${base} ${variants[variant]} ${sizes[size]}${fullWidth ? ' w-full' : ''}`,
  )
</script>

{#if href}
  <a {href} class={classes}>{@render children()}</a>
{:else}
  <button {type} disabled={disabled || loading} {onclick} class={classes}>
    {@render children()}
  </button>
{/if}
