<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button } from '@heedback/ui-kit'
</script>

<div class="text-center py-16">
  <h1 class="text-6xl font-bold text-slate-300">{$_('not_found.title')}</h1>
  <p class="mt-4 text-lg text-slate-500">{$_('not_found.message')}</p>
  <div class="mt-6">
    <Button href="/" variant="secondary">{$_('not_found.go_home')}</Button>
  </div>
</div>
