<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Input, Textarea, Select, Alert, TitleWithSlug } from '@heedback/ui-kit'
  import { createArticleEditorState } from './ArticleEditor.svelte.ts'

  let { id }: { id?: string } = $props()

  const state = createArticleEditorState(id)

  onMount(state.load)
</script>

<div class="max-w-4xl">
  <h1 class="text-2xl font-bold text-gray-900">
    {state.isEdit ? 'Edit Article' : 'New Article'}
  </h1>

  {#if state.error}
    <div class="mt-4">
      <Alert variant="error">{state.error}</Alert>
    </div>
  {/if}

  <form onsubmit={state.handleSubmit} class="mt-8 space-y-6">
    <TitleWithSlug bind:title={state.title} bind:slug={state.slug} required />

    <Textarea id="body" label="Content (Markdown)" bind:value={state.body} rows={20} mono />

    <div class="grid grid-cols-3 gap-6">
      <Select id="status" label="Status" bind:value={state.status}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </Select>
      <Input id="locale" label="Locale" bind:value={state.locale} />
      <Input id="seoTitle" label="SEO Title" bind:value={state.seoTitle} />
    </div>

    <div class="flex items-center gap-4">
      <Button type="submit" loading={state.saving}>
        {state.saving ? 'Saving...' : state.isEdit ? 'Update Article' : 'Create Article'}
      </Button>
      <Button href="/articles" variant="secondary">Cancel</Button>
    </div>
  </form>
</div>
