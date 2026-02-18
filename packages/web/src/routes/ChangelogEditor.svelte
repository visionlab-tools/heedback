<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Input, Textarea, Select, Alert, TitleWithSlug } from '@heedback/ui-kit'
  import LocaleTabs from '../lib/components/LocaleTabs.svelte'
  import { createChangelogEditorState, allLabels } from './ChangelogEditor.svelte.ts'

  let { id, orgSlug }: { id?: string; orgSlug: string } = $props()

  const state = createChangelogEditorState(id)

  onMount(state.load)
</script>

<div class="max-w-4xl">
  <h1 class="text-2xl font-semibold text-slate-900">
    {state.isEdit ? $_('changelog_editor.edit') : $_('changelog_editor.new')}
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

    <Textarea id="body" label={$_('changelog_editor.content')} bind:value={state.body} rows={15} mono />

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2">{$_('changelog_editor.labels')}</label>
      <div class="flex gap-2">
        {#each allLabels as label}
          <button
            type="button"
            onclick={() => state.toggleLabel(label)}
            class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors {state.hasLabel(label) ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}"
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <Select id="status" label={$_('common.status')} bind:value={state.status}>
        <option value="draft">{$_('changelog_editor.status_draft')}</option>
        <option value="scheduled">{$_('changelog_editor.status_scheduled')}</option>
        <option value="published">{$_('changelog_editor.status_published')}</option>
      </Select>
      {#if state.status === 'scheduled'}
        <Input id="scheduledAt" label={$_('changelog_editor.scheduled_at')} type="datetime-local" bind:value={state.scheduledAt} />
      {/if}
    </div>

    <div class="flex items-center gap-3">
      <Button type="submit" loading={state.saving}>
        {state.saving ? $_('common.saving') : state.isEdit ? $_('common.update') : $_('common.create')}
      </Button>
      <Button href="/{orgSlug}/changelog" variant="secondary">{$_('common.cancel')}</Button>
    </div>
  </form>
</div>
