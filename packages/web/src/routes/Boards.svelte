<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  interface Board {
    id: string
    name: string
    slug: string
    description: string | null
    isPublic: boolean
    postCount?: number
  }

  let boards = $state<Board[]>([])
  let loading = $state(true)
  let orgSlug = $state('')
  let showForm = $state(false)
  let editingId = $state<string | null>(null)

  let formName = $state('')
  let formSlug = $state('')
  let formDescription = $state('')
  let formIsPublic = $state(true)
  let saving = $state(false)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(loadBoards)

  async function loadBoards() {
    if (!orgSlug) return
    try {
      const data = await api.get<{ data: Board[] }>(`/org/${orgSlug}/boards`)
      boards = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  function openCreate() {
    editingId = null
    formName = ''
    formSlug = ''
    formDescription = ''
    formIsPublic = true
    showForm = true
  }

  function openEdit(board: Board) {
    editingId = board.id
    formName = board.name
    formSlug = board.slug
    formDescription = board.description || ''
    formIsPublic = board.isPublic
    showForm = true
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    saving = true
    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription || null,
      isPublic: formIsPublic,
    }
    try {
      if (editingId) {
        await api.patch(`/org/${orgSlug}/boards/${editingId}`, payload)
      } else {
        await api.post(`/org/${orgSlug}/boards`, payload)
      }
      showForm = false
      loading = true
      await loadBoards()
    } catch {
      // Handle error
    } finally {
      saving = false
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this board?')) return
    await api.delete(`/org/${orgSlug}/boards/${id}`)
    loading = true
    await loadBoards()
  }
</script>

<div>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Boards</h1>
      <p class="mt-1 text-sm text-gray-500">Manage feedback boards.</p>
    </div>
    <button onclick={openCreate} class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
      New Board
    </button>
  </div>

  {#if showForm}
    <div class="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        {editingId ? 'Edit Board' : 'New Board'}
      </h2>
      <form onsubmit={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" type="text" bind:value={formName} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
            <input id="slug" type="text" bind:value={formSlug} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label for="desc" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="desc" bind:value={formDescription} rows={2} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
        </div>
        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={formIsPublic} class="rounded border-gray-300" />
          <span class="text-sm text-gray-700">Public board</span>
        </label>
        <div class="flex gap-3">
          <button type="submit" disabled={saving} class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          <button type="button" onclick={() => (showForm = false)} class="px-4 py-2 text-sm text-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  {/if}

  {#if loading}
    <div class="mt-8 text-center text-gray-500">Loading...</div>
  {:else if boards.length === 0}
    <div class="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
      <p class="text-gray-500">No boards yet.</p>
    </div>
  {:else}
    <div class="mt-8 space-y-3">
      {#each boards as board}
        <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">{board.name}</p>
            <p class="text-sm text-gray-500">/{board.slug} · {board.postCount || 0} posts · {board.isPublic ? 'Public' : 'Private'}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick={() => openEdit(board)} class="text-sm text-indigo-600 hover:text-indigo-800">Edit</button>
            <button onclick={() => handleDelete(board.id)} class="text-sm text-red-600 hover:text-red-800">Delete</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
