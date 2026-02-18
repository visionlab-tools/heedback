<!--
  Reusable modal with backdrop, ESC to close, and click-outside dismiss.
  Set `blocking` to prevent closing via backdrop/ESC (onboarding flows).
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    open = false,
    title = '',
    blocking = false,
    onclose,
    children,
  }: {
    open?: boolean
    title?: string
    blocking?: boolean
    onclose?: () => void
    children: Snippet
  } = $props()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !blocking) onclose?.()
  }

  function handleBackdrop() {
    if (!blocking) onclose?.()
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    onkeydown={handleKeydown}
    onclick={handleBackdrop}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6"
      onclick={(e) => e.stopPropagation()}
    >
      {#if title}
        <h2 class="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      {/if}
      {@render children()}
    </div>
  </div>
{/if}
