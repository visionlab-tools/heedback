<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Input, Textarea, Checkbox, Card, PageHeader, EmptyState, LoadingSpinner, TitleWithSlug } from '@heedback/ui-kit'
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
        await api.put(`/org/${orgSlug}/boards/${editingId}`, payload)
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
    if (!confirm($_('boards.confirm_delete'))) return
    await api.delete(`/org/${orgSlug}/boards/${id}`)
    loading = true
    await loadBoards()
  }
</script>

<div>
  <PageHeader title={$_('boards.title')} subtitle={$_('boards.subtitle')}>
    {#snippet actions()}
      <Button onclick={openCreate} size="sm">{$_('boards.new')}</Button>
    {/snippet}
  </PageHeader>

  {#if showForm}
    <Card padding="md">
      <h2 class="text-lg font-semibold text-slate-900 mb-4">
        {editingId ? $_('boards.edit') : $_('boards.new')}
      </h2>
      <form onsubmit={handleSubmit} class="space-y-4">
        <TitleWithSlug titleLabel={$_('common.name')} bind:title={formName} bind:slug={formSlug} required />
        <Textarea id="desc" label={$_('common.description')} bind:value={formDescription} rows={2} />
        <Checkbox label={$_('boards.public_board')} bind:checked={formIsPublic} />
        <div class="flex gap-3">
          <Button type="submit" loading={saving} size="sm">
            {saving ? $_('common.saving') : editingId ? $_('common.update') : $_('common.create')}
          </Button>
          <Button variant="secondary" onclick={() => (showForm = false)} size="sm">{$_('common.cancel')}</Button>
        </div>
      </form>
    </Card>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if boards.length === 0}
    <EmptyState message={$_('boards.empty')} />
  {:else}
    <div class="space-y-3">
      {#each boards as board}
        <Card padding="sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-900">{board.name}</p>
              <p class="text-sm text-slate-500">/{board.slug} · {$_('boards.posts_count', { values: { count: board.postCount || 0 } })} · {board.isPublic ? $_('common.public') : $_('common.private')}</p>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" onclick={() => openEdit(board)} size="sm">{$_('common.edit')}</Button>
              <Button variant="danger" onclick={() => handleDelete(board.id)} size="sm">{$_('common.delete')}</Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
