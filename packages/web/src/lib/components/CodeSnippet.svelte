<script lang="ts">
  import { Copy, Check } from 'lucide-svelte'

  let { code, language = 'html' }: { code: string; language?: string } = $props()

  let copied = $state(false)

  async function copyToClipboard() {
    await navigator.clipboard.writeText(code)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }
</script>

<div class="relative group">
  <button
    onclick={copyToClipboard}
    class="absolute right-3 top-3 p-1.5 rounded-md bg-slate-700 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600"
    title="Copy to clipboard"
  >
    {#if copied}
      <Check class="w-4 h-4 text-green-400" />
    {:else}
      <Copy class="w-4 h-4" />
    {/if}
  </button>
  <pre
    class="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto leading-relaxed"
  ><code class="language-{language}">{code}</code></pre>
</div>
