<script lang="ts">
  import { initPortalI18n } from '$lib/i18n'
  import type { LayoutData } from './$types'
  import type { Snippet } from 'svelte'

  let { data, children }: { data: LayoutData; children: Snippet } = $props()

  // Initialize svelte-i18n with the URL-driven locale
  initPortalI18n(data.locale)
</script>

{@render children()}
