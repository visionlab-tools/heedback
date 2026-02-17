<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { FolderOpen } from 'lucide-svelte'
  import { Button, Input, Textarea, Card, PageHeader, EmptyState, LoadingSpinner, TitleWithSlug } from '@heedback/ui-kit'
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
    return collection.translations[0]?.name || $_('common.untitled')
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
    if (!confirm($_('collections.confirm_delete'))) return
    await api.delete(`/org/${orgSlug}/collections/${id}`)
    loading = true
    await loadCollections()
  }
</script>

<div>
  <PageHeader title={$_('collections.title')} subtitle={$_('collections.subtitle')}>
    {#snippet actions()}
      <Button onclick={openCreate} size="sm">{$_('collections.new')}</Button>
    {/snippet}
  </PageHeader>

  {#if showForm}
    <div class="mb-6">
      <Card padding="md">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? $_('collections.edit') : $_('collections.new')}
        </h2>
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <TitleWithSlug titleLabel={$_('common.name')} bind:title={formName} bind:slug={formSlug} required />
            <Input id="icon" label={$_('collections.icon')} bind:value={formIcon} placeholder="📚" />
          </div>
          <Textarea id="description" label={$_('common.description')} bind:value={formDescription} rows={2} />
          <div class="flex gap-3">
            <Button type="submit" loading={saving} size="sm">
              {saving ? $_('common.saving') : editingId ? $_('common.update') : $_('common.create')}
            </Button>
            <Button variant="secondary" onclick={() => (showForm = false)} size="sm">{$_('common.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if collections.length === 0}
    <EmptyState message={$_('collections.empty')} />
  {:else}
    <div class="space-y-3">
      {#each collections as collection}
        <Card padding="sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              {#if collection.icon}
                <span class="text-xl">{collection.icon}</span>
              {:else}
                <FolderOpen size={20} class="text-slate-400" />
              {/if}
              <div>
                <p class="font-medium text-slate-900">{getName(collection)}</p>
                <p class="text-sm text-slate-500">/{collection.slug} · {$_('collections.articles_count', { values: { count: collection.articleCount || 0 } })}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" onclick={() => openEdit(collection)} size="sm">{$_('common.edit')}</Button>
              <Button variant="danger" onclick={() => handleDelete(collection.id)} size="sm">{$_('common.delete')}</Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
