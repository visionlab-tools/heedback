<script lang="ts">
  import { marked } from 'marked'

  let { content = '' }: { content?: string | null } = $props()

  let html = $derived(content ? marked.parse(content, { async: false }) as string : '')
</script>

<div class="prose prose-gray max-w-none">
  {@html html}
</div>
