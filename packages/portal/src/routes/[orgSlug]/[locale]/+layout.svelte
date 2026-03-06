<script lang="ts">
  import { initPortalI18n } from '$lib/i18n'
  import PortalHeader from '$lib/components/PortalHeader.svelte'
  import PortalFooter from '$lib/components/PortalFooter.svelte'
  import type { LayoutData } from './$types'
  import type { Snippet } from 'svelte'

  let { data, children }: { data: LayoutData; children: Snippet } = $props()

  // Initialize svelte-i18n with the URL-driven locale
  initPortalI18n(data.locale)
</script>

<div class="min-h-screen flex flex-col">
  <PortalHeader />
  <main class="flex-1">
    {@render children()}
  </main>
  <PortalFooter />
</div>
