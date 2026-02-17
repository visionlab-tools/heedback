<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Input, Textarea, Select, Alert, TitleWithSlug } from '@heedback/ui-kit'
  import { createArticleEditorState } from './ArticleEditor.svelte.ts'

  let { id }: { id?: string } = $props()

  const state = createArticleEditorState(id)

  onMount(state.load)
</script>

<div class="max-w-4xl">
  <h1 class="text-2xl font-semibold text-slate-900">
    {state.isEdit ? $_('article_editor.edit') : $_('article_editor.new')}
  </h1>

  {#if state.error}
    <div class="mt-4">
      <Alert variant="error">{state.error}</Alert>
    </div>
  {/if}

  <form onsubmit={state.handleSubmit} class="mt-8 space-y-6">
    <TitleWithSlug bind:title={state.title} bind:slug={state.slug} required />

    <Textarea id="body" label={$_('article_editor.content')} bind:value={state.body} rows={20} mono />

    <div class="grid grid-cols-3 gap-6">
      <Select id="status" label={$_('common.status')} bind:value={state.status}>
        <option value="draft">{$_('article_editor.status_draft')}</option>
        <option value="published">{$_('article_editor.status_published')}</option>
        <option value="archived">{$_('article_editor.status_archived')}</option>
      </Select>
      <Input id="locale" label={$_('article_editor.locale')} bind:value={state.locale} />
      <Input id="seoTitle" label={$_('article_editor.seo_title')} bind:value={state.seoTitle} />
    </div>

    <div class="flex items-center gap-3">
      <Button type="submit" loading={state.saving}>
        {state.saving ? $_('common.saving') : state.isEdit ? $_('article_editor.update') : $_('article_editor.create')}
      </Button>
      <Button href="/articles" variant="secondary">{$_('common.cancel')}</Button>
    </div>
  </form>
</div>
