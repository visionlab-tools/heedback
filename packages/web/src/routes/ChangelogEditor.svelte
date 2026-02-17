<script lang="ts">
  import { onMount } from 'svelte'
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
    <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
  {/if}

  <form onsubmit={state.handleSubmit} class="mt-8 space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input id="title" type="text" bind:value={state.title} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
        <input id="slug" type="text" bind:value={state.slug} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>

    <div>
      <label for="body" class="block text-sm font-medium text-gray-700">Content <span class="text-xs text-gray-400 font-normal">(Markdown)</span></label>
      <textarea id="body" bind:value={state.body} rows={15} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"></textarea>
    </div>

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
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" bind:value={state.status} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>
      {#if state.status === 'scheduled'}
        <div>
          <label for="scheduledAt" class="block text-sm font-medium text-gray-700">Scheduled At</label>
          <input id="scheduledAt" type="datetime-local" bind:value={state.scheduledAt} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-4">
      <button type="submit" disabled={state.saving} class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {state.saving ? 'Saving...' : state.isEdit ? 'Update' : 'Create'}
      </button>
      <a href="/changelog" class="text-sm text-gray-600 hover:text-gray-800">Cancel</a>
    </div>
  </form>
</div>
