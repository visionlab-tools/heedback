<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Button, Badge, Card, PageHeader, EmptyState, LoadingSpinner } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  interface ChangelogEntry {
    id: string
    slug: string
    status: string
    labels: string[]
    publishedAt: string | null
    translations: Array<{ locale: string; title: string }>
  }

  let entries = $state<ChangelogEntry[]>([])
  let loading = $state(true)
  let orgSlug = $state('')

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  onMount(async () => {
    if (!orgSlug) return
    try {
      const data = await api.get<{ data: ChangelogEntry[] }>(`/org/${orgSlug}/changelog`)
      entries = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  })

  type BadgeVariant = 'success' | 'info' | 'orange' | 'danger' | 'neutral'

  function labelVariant(label: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      new: 'success',
      improvement: 'info',
      fix: 'orange',
      breaking: 'danger',
    }
    return map[label] || 'neutral'
  }
</script>

<div>
  <PageHeader title={$_('changelog.title')} subtitle={$_('changelog.subtitle')}>
    {#snippet actions()}
      <Button href="/changelog/new" size="sm">{$_('changelog.new')}</Button>
    {/snippet}
  </PageHeader>

  {#if loading}
    <LoadingSpinner />
  {:else if entries.length === 0}
    <EmptyState message={$_('changelog.empty')} />
  {:else}
    <div class="space-y-3">
      {#each entries as entry}
        <Card href="/changelog/{entry.id}/edit" padding="sm" interactive>
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                {#each entry.labels as label}
                  <Badge variant={labelVariant(label)}>{label}</Badge>
                {/each}
                <span class="text-xs text-slate-400">{entry.status}</span>
              </div>
              <h3 class="mt-1 font-medium text-slate-900">{entry.translations[0]?.title || $_('common.untitled')}</h3>
            </div>
            {#if entry.publishedAt}
              <span class="text-xs text-slate-500">{new Date(entry.publishedAt).toLocaleDateString()}</span>
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
