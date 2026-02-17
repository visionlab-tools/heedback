<script lang="ts">
  import { onMount } from 'svelte'
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
    <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      {state.error}
    </div>
  {/if}

  <form onsubmit={state.handleSubmit} class="mt-8 space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          type="text"
          bind:value={state.title}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
        <input
          id="slug"
          type="text"
          bind:value={state.slug}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>

    <div>
      <label for="body" class="block text-sm font-medium text-gray-700">Content <span class="text-xs text-gray-400 font-normal">(Markdown)</span></label>
      <textarea
        id="body"
        bind:value={state.body}
        rows={20}
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
      ></textarea>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          bind:value={state.status}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <label for="locale" class="block text-sm font-medium text-gray-700">Locale</label>
        <input
          id="locale"
          type="text"
          bind:value={state.locale}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="seoTitle" class="block text-sm font-medium text-gray-700">SEO Title</label>
        <input
          id="seoTitle"
          type="text"
          bind:value={state.seoTitle}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button
        type="submit"
        disabled={state.saving}
        class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {state.saving ? 'Saving...' : state.isEdit ? 'Update Article' : 'Create Article'}
      </button>
      <a href="/articles" class="text-sm text-gray-600 hover:text-gray-800">Cancel</a>
    </div>
  </form>
</div>
