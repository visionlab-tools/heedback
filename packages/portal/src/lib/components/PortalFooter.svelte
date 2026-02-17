<script lang="ts">
  import { _ } from 'svelte-i18n'

  let { orgName = 'Heedback' }: { orgName?: string } = $props()
</script>

<footer class="border-t border-gray-200 mt-16">
  <div class="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
    {$_('portal.powered_by')} <a href="https://github.com/visionlab-tools/heedback" class="text-gray-500 hover:text-gray-700" target="_blank" rel="noopener noreferrer">Heedback</a>
  </div>
</footer>
