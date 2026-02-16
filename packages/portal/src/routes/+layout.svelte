<script lang="ts">
  import '../app.css'
  import PortalHeader from '$lib/components/PortalHeader.svelte'
  import PortalFooter from '$lib/components/PortalFooter.svelte'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div class="min-h-screen flex flex-col">
  <PortalHeader />
  <main class="flex-1">
    {@render children()}
  </main>
  <PortalFooter />
</div>
