<!--
  WYSIWYG markdown editor powered by TipTap.
  Stores content as markdown but edits rich text.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import { Markdown } from 'tiptap-markdown'

  let { value = '', onchange, label, rows = 15 }: {
    value?: string
    onchange?: (markdown: string) => void
    label?: string
    rows?: number
  } = $props()

  let element: HTMLDivElement
  let editor = $state<Editor | undefined>(undefined)
  // Incremented on each TipTap transaction to bridge into Svelte reactivity
  let txVersion = $state(0)
  let minHeight = $derived(`${rows * 1.5}rem`)

  // Toolbar definition — data-driven to keep template DRY
  type Tool = { cmd: string; check: string; label: string; title: string; attrs?: Record<string, any> }
  const TOOLBAR: (Tool | 'sep')[] = [
    { cmd: 'toggleBold', check: 'bold', label: 'B', title: 'Bold' },
    { cmd: 'toggleItalic', check: 'italic', label: 'I', title: 'Italic' },
    'sep',
    { cmd: 'toggleHeading', check: 'heading', label: 'H2', title: 'Heading 2', attrs: { level: 2 } },
    { cmd: 'toggleHeading', check: 'heading', label: 'H3', title: 'Heading 3', attrs: { level: 3 } },
    'sep',
    { cmd: 'toggleBulletList', check: 'bulletList', label: '\u2022', title: 'Bullet list' },
    { cmd: 'toggleOrderedList', check: 'orderedList', label: '1.', title: 'Numbered list' },
    'sep',
    { cmd: 'toggleCode', check: 'code', label: '</>', title: 'Inline code' },
    { cmd: 'toggleCodeBlock', check: 'codeBlock', label: '{ }', title: 'Code block' },
    { cmd: 'toggleBlockquote', check: 'blockquote', label: '\u201C', title: 'Quote' },
    { cmd: 'setHorizontalRule', check: '', label: '\u2014', title: 'Divider' },
  ]

  // Re-derives on every TipTap transaction so toolbar active states stay in sync
  let isActive = $derived.by(() => {
    void txVersion
    return (check: string, attrs?: Record<string, any>) =>
      check ? (editor?.isActive(check, attrs) ?? false) : false
  })

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        StarterKit,
        Markdown.configure({ html: false, transformPastedText: true }),
      ],
      content: value,
      onUpdate: ({ editor: ed }: { editor: Editor }) => {
        const md = (ed.storage as any).markdown.getMarkdown() as string
        onchange?.(md)
      },
      onTransaction: () => { txVersion++ },
    })
  })

  onDestroy(() => editor?.destroy())

  function runCommand(tool: Tool) {
    const chain = editor!.chain().focus() as any
    ;(tool.attrs ? chain[tool.cmd](tool.attrs) : chain[tool.cmd]()).run()
  }
</script>

{#if label}
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="block text-sm font-medium text-slate-700 mb-1">{label}</label>
{/if}

<div class="rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors">
  {#if editor}
    <div class="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1.5 bg-slate-50 rounded-t-lg">
      {#each TOOLBAR as tool}
        {#if tool === 'sep'}
          <div class="w-px h-6 bg-slate-200 mx-1"></div>
        {:else}
          <button
            type="button"
            onclick={() => runCommand(tool)}
            title={tool.title}
            class="px-2 py-1 rounded text-sm font-medium transition-colors
              {isActive(tool.check, tool.attrs)
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-200'}"
          >{tool.label}</button>
        {/if}
      {/each}
    </div>
  {/if}

  <div
    bind:this={element}
    class="markdown-editor prose prose-sm max-w-none px-4 py-3"
    style:min-height={minHeight}
  ></div>
</div>

<style>
  .markdown-editor :global(.ProseMirror) {
    outline: none;
    min-height: inherit;
  }

  .markdown-editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: 'Start writing...';
    color: #94a3b8;
    float: left;
    pointer-events: none;
    height: 0;
  }
</style>
