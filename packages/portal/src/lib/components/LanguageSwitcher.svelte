<script lang="ts">
  import { page } from '$app/stores'
  import { UI_LOCALES } from '@heedback/shared'

  /** Builds a URL for a different locale, keeping the rest of the path intact */
  function localeUrl(newLocale: string): string {
    const path = $page.url.pathname
    const segments = path.split('/')
    segments[1] = newLocale
    return segments.join('/')
  }
</script>

<div class="flex items-center gap-1">
  {#each UI_LOCALES as loc}
    <a
      href={localeUrl(loc)}
      class="text-sm px-2 py-1 rounded {$page.params.locale === loc
        ? 'bg-indigo-100 text-indigo-700 font-medium'
        : 'text-gray-500 hover:text-gray-700'}"
    >
      {loc.toUpperCase()}
    </a>
  {/each}
</div>
