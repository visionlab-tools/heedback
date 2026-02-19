<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, MarkdownEditor, Select, Alert, TitleWithSlug } from '@heedback/ui-kit'
  import LocaleTabs from '../lib/components/LocaleTabs.svelte'
  import { createArticleEditorState } from './ArticleEditor.svelte.ts'

  let { id, orgId }: { id?: string; orgId: string } = $props()

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
    {#if state.orgLocales.length > 1}
      <LocaleTabs
        locales={state.orgLocales}
        active={state.activeLocale}
        onchange={state.setActiveLocale}
      />
    {/if}

    <TitleWithSlug bind:title={state.title} bind:slug={state.slug} required />

    <MarkdownEditor label={$_('article_editor.content')} value={state.body} onchange={(v) => (state.body = v)} rows={20} />

    <div class="grid grid-cols-2 gap-4">
      <Select id="status" label={$_('common.status')} bind:value={state.status}>
        <option value="draft">{$_('article_editor.status_draft')}</option>
        <option value="published">{$_('article_editor.status_published')}</option>
        <option value="archived">{$_('article_editor.status_archived')}</option>
      </Select>

      <Select id="collection" label={$_('articles.col_collection')} bind:value={state.collectionId}>
        <option value="">—</option>
        {#each state.collections as col}
          <option value={col.id}>{col.name}</option>
        {/each}
      </Select>
    </div>

    <div class="flex items-center gap-3">
      <Button type="submit" loading={state.saving}>
        {state.saving ? $_('common.saving') : state.isEdit ? $_('article_editor.update') : $_('article_editor.create')}
      </Button>
      <Button href="/{orgId}/articles" variant="secondary">{$_('common.cancel')}</Button>
    </div>
  </form>
</div>
