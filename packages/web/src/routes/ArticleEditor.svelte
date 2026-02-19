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

    <Select id="status" label={$_('common.status')} bind:value={state.status}>
      <option value="draft">{$_('article_editor.status_draft')}</option>
      <option value="published">{$_('article_editor.status_published')}</option>
      <option value="archived">{$_('article_editor.status_archived')}</option>
    </Select>

    {#if state.tags.length > 0}
      <fieldset>
        <legend class="text-sm font-medium text-slate-700 mb-2">{$_('article_editor.tags')}</legend>
        <div class="flex flex-wrap gap-3">
          {#each state.tags as tag}
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.selectedTagIds.includes(tag.id)}
                onchange={() => {
                  if (state.selectedTagIds.includes(tag.id)) {
                    state.selectedTagIds = state.selectedTagIds.filter((tid) => tid !== tag.id)
                  } else {
                    state.selectedTagIds = [...state.selectedTagIds, tag.id]
                  }
                }}
                class="rounded border-slate-300"
              />
              <span class="text-sm text-slate-700">{tag.name}</span>
            </label>
          {/each}
        </div>
      </fieldset>
    {/if}

    <div class="flex items-center gap-3">
      <Button type="submit" loading={state.saving}>
        {state.saving ? $_('common.saving') : state.isEdit ? $_('article_editor.update') : $_('article_editor.create')}
      </Button>
      <Button href="/{orgId}/articles" variant="secondary">{$_('common.cancel')}</Button>
    </div>
  </form>
</div>
