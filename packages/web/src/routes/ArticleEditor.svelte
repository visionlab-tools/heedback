<script lang="ts">
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  let { id }: { id?: string } = $props()

  let orgSlug = $state('')
  let title = $state('')
  let body = $state('')
  let slug = $state('')
  let status = $state<'draft' | 'published' | 'archived'>('draft')
  let locale = $state('en')
  let collectionId = $state('')
  let seoTitle = $state('')
  let seoDescription = $state('')
  let saving = $state(false)
  let error = $state('')

  let isEdit = $derived(!!id)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(async () => {
    if (isEdit && orgSlug) {
      try {
        const data = await api.get<{ data: any }>(`/org/${orgSlug}/articles/${id}`)
        const article = data.data
        slug = article.slug
        status = article.status
        seoTitle = article.seoTitle || ''
        seoDescription = article.seoDescription || ''
        collectionId = article.collectionId || ''
        if (article.translations?.[0]) {
          title = article.translations[0].title
          body = article.translations[0].body
          locale = article.translations[0].locale
        }
      } catch {
        error = 'Failed to load article'
      }
    }
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    error = ''

    const payload = {
      slug,
      status,
      collectionId: collectionId || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      translations: [{ locale, title, body }],
    }

    try {
      if (isEdit) {
        await api.patch(`/org/${orgSlug}/articles/${id}`, payload)
      } else {
        await api.post(`/org/${orgSlug}/articles`, payload)
      }
      navigate('/articles')
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to save article'
    } finally {
      saving = false
    }
  }
</script>

<div class="max-w-4xl">
  <h1 class="text-2xl font-bold text-gray-900">
    {isEdit ? 'Edit Article' : 'New Article'}
  </h1>

  {#if error}
    <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      {error}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="mt-8 space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
        <input
          id="slug"
          type="text"
          bind:value={slug}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>

    <div>
      <label for="body" class="block text-sm font-medium text-gray-700">Content</label>
      <textarea
        id="body"
        bind:value={body}
        rows={20}
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
      ></textarea>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          bind:value={status}
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
          bind:value={locale}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="seoTitle" class="block text-sm font-medium text-gray-700">SEO Title</label>
        <input
          id="seoTitle"
          type="text"
          bind:value={seoTitle}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button
        type="submit"
        disabled={saving}
        class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
      </button>
      <a href="/articles" class="text-sm text-gray-600 hover:text-gray-800">Cancel</a>
    </div>
  </form>
</div>
