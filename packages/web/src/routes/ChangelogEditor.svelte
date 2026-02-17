<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Input, Textarea, Select, Alert, TitleWithSlug } from '@heedback/ui-kit'
  import { createChangelogEditorState, allLabels } from './ChangelogEditor.svelte.ts'

  let { id }: { id?: string } = $props()

  const state = createChangelogEditorState(id)

  onMount(state.load)
</script>

<div class="max-w-4xl">
  <h1 class="text-2xl font-bold text-gray-900">
    {state.isEdit ? 'Edit Changelog Entry' : 'New Changelog Entry'}
  </h1>

  {#if state.error}
    <div class="mt-4">
      <Alert variant="error">{state.error}</Alert>
    </div>
  {/if}

  <form onsubmit={state.handleSubmit} class="mt-8 space-y-6">
    <TitleWithSlug bind:title={state.title} bind:slug={state.slug} required />

    <Textarea id="body" label="Content (Markdown)" bind:value={state.body} rows={15} mono />

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Labels</label>
      <div class="flex gap-2">
        {#each allLabels as label}
          <button
            type="button"
            onclick={() => state.toggleLabel(label)}
            class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors {state.hasLabel(label) ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}"
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <Select id="status" label="Status" bind:value={state.status}>
        <option value="draft">Draft</option>
        <option value="scheduled">Scheduled</option>
        <option value="published">Published</option>
      </Select>
      {#if state.status === 'scheduled'}
        <Input id="scheduledAt" label="Scheduled At" type="datetime-local" bind:value={state.scheduledAt} />
      {/if}
    </div>

    <div class="flex items-center gap-4">
      <Button type="submit" loading={state.saving}>
        {state.saving ? 'Saving...' : state.isEdit ? 'Update' : 'Create'}
      </Button>
      <Button href="/changelog" variant="secondary">Cancel</Button>
    </div>
  </form>
</div>
