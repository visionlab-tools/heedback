<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  interface Collection {
    id: string
    slug: string
    icon: string | null
    position: number
    translations: Array<{ locale: string; name: string; description: string | null }>
    articleCount?: number
    children?: Collection[]
  }

  let collections = $state<Collection[]>([])
  let loading = $state(true)
  let orgSlug = $state('')
  let showForm = $state(false)
  let editingId = $state<string | null>(null)

  let formName = $state('')
  let formSlug = $state('')
  let formDescription = $state('')
  let formIcon = $state('')
  let saving = $state(false)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(loadCollections)

  async function loadCollections() {
    if (!orgSlug) return
    try {
      const data = await api.get<{ data: Collection[] }>(`/org/${orgSlug}/collections`)
      collections = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  function getName(collection: Collection): string {
    return collection.translations[0]?.name || 'Untitled'
  }

  function openCreate() {
    editingId = null
    formName = ''
    formSlug = ''
    formDescription = ''
    formIcon = ''
    showForm = true
  }

  function openEdit(collection: Collection) {
    editingId = collection.id
    formName = collection.translations[0]?.name || ''
    formSlug = collection.slug
    formDescription = collection.translations[0]?.description || ''
    formIcon = collection.icon || ''
    showForm = true
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true

    const payload = {
      slug: formSlug,
      icon: formIcon || null,
      translations: [{ locale: 'en', name: formName, description: formDescription || null }],
    }

    try {
      if (editingId) {
        await api.patch(`/org/${orgSlug}/collections/${editingId}`, payload)
      } else {
        await api.post(`/org/${orgSlug}/collections`, payload)
      }
      showForm = false
      loading = true
      await loadCollections()
    } catch {
      // Handle error
    } finally {
      saving = false
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return
    await api.delete(`/org/${orgSlug}/collections/${id}`)
    loading = true
    await loadCollections()
  }
</script>

<div>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Collections</h1>
      <p class="mt-1 text-sm text-gray-500">Organize your help center articles into collections.</p>
    </div>
    <button
      onclick={openCreate}
      class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
    >
      New Collection
    </button>
  </div>

  {#if showForm}
    <div class="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        {editingId ? 'Edit Collection' : 'New Collection'}
      </h2>
      <form onsubmit={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" type="text" bind:value={formName} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
            <input id="slug" type="text" bind:value={formSlug} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="icon" class="block text-sm font-medium text-gray-700">Icon</label>
            <input id="icon" type="text" bind:value={formIcon} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="📚" />
          </div>
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" bind:value={formDescription} rows={2} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" disabled={saving} class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          <button type="button" onclick={() => (showForm = false)} class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}

  {#if loading}
    <div class="mt-8 text-center text-gray-500">Loading...</div>
  {:else if collections.length === 0}
    <div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
      <p class="text-gray-500">No collections yet.</p>
    </div>
  {:else}
    <div class="mt-8 space-y-3">
      {#each collections as collection}
        <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xl">{collection.icon || '📁'}</span>
            <div>
              <p class="font-medium text-gray-900">{getName(collection)}</p>
              <p class="text-sm text-gray-500">/{collection.slug} · {collection.articleCount || 0} articles</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick={() => openEdit(collection)} class="text-sm text-indigo-600 hover:text-indigo-800">Edit</button>
            <button onclick={() => handleDelete(collection.id)} class="text-sm text-red-600 hover:text-red-800">Delete</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
