<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Input, PageHeader, EmptyState, DataTable, LoadingSpinner } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { navigate } from '../lib/router.svelte.ts'

  interface EndUser {
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
    displayName: string | null
    avatarUrl: string | null
    company: string | null
    pricingPlan: string | null
    createdAt: string
    conversations_count?: number
  }

  interface PaginationMeta {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }

  let { orgId }: { orgId: string } = $props()

  let endUsers = $state<EndUser[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let search = $state('')
  let searchTimeout = $state<ReturnType<typeof setTimeout> | null>(null)
  let currentPage = $state(1)
  let lastPage = $state(1)
  let hasMore = $derived(currentPage < lastPage)
  let sentinel: HTMLDivElement | undefined = $state()

  async function fetchEndUsers(resetList = true) {
    if (!orgId) return
    if (resetList) loading = true
    try {
      const params = new URLSearchParams({ page: '1', limit: '20' })
      if (search) params.set('search', search)
      const data = await api.get<{ data: EndUser[]; meta: PaginationMeta }>(
        `/org/${orgId}/end-users?${params}`,
      )
      endUsers = data.data
      lastPage = data.meta.lastPage
      currentPage = 1
    } finally {
      loading = false
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return
    loadingMore = true
    try {
      const nextPage = currentPage + 1
      const params = new URLSearchParams({ page: String(nextPage), limit: '20' })
      if (search) params.set('search', search)
      const data = await api.get<{ data: EndUser[]; meta: PaginationMeta }>(
        `/org/${orgId}/end-users?${params}`,
      )
      endUsers = [...endUsers, ...data.data]
      currentPage = nextPage
      lastPage = data.meta.lastPage
    } finally {
      loadingMore = false
    }
  }

  function handleSearch(e: Event) {
    search = (e.target as HTMLInputElement).value
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fetchEndUsers(), 300)
  }

  onMount(fetchEndUsers)

  $effect(() => {
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  })

  function displayName(user: EndUser): string {
    return user.displayName || user.email || $_('common.anonymous')
  }

  function initial(user: EndUser): string {
    return (user.displayName || user.email || '?')[0].toUpperCase()
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString()
  }

  let columns = $derived([
    { label: $_('contacts.col_name') },
    { label: $_('contacts.col_email') },
    { label: $_('contacts.col_company') },
    { label: $_('contacts.col_plan') },
    { label: $_('contacts.col_created') },
    { label: $_('contacts.col_conversations'), align: 'right' as const },
  ])
</script>

<div>
  <PageHeader title={$_('contacts.title')} subtitle={$_('contacts.subtitle')}>
    {#snippet actions()}
      <Input
        type="search"
        placeholder={$_('contacts.search_placeholder')}
        value={search}
        oninput={handleSearch}
      />
    {/snippet}
  </PageHeader>

  {#if loading}
    <LoadingSpinner />
  {:else if endUsers.length === 0}
    <EmptyState message={$_('contacts.empty')} />
  {:else}
    <DataTable {columns}>
      {#each endUsers as user}
        <tr
          class="hover:bg-slate-50 transition-colors cursor-pointer"
          onclick={() => navigate(`/${orgId}/contacts/${user.id}`)}
        >
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              {#if user.avatarUrl}
                <img src={user.avatarUrl} alt="" class="w-8 h-8 rounded-full object-cover shrink-0" />
              {:else}
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {initial(user)}
                </div>
              {/if}
              <span class="text-sm font-medium text-slate-900">{displayName(user)}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">{user.email ?? '—'}</td>
          <td class="px-6 py-4 text-sm text-slate-500">{user.company ?? '—'}</td>
          <td class="px-6 py-4 text-sm text-slate-500">{user.pricingPlan ?? '—'}</td>
          <td class="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
          <td class="px-6 py-4 text-sm text-slate-500 text-right">{user.conversations_count ?? 0}</td>
        </tr>
      {/each}
    </DataTable>

    {#if loadingMore}
      <div class="py-4 text-center">
        <LoadingSpinner />
      </div>
    {/if}

    {#if hasMore}
      <div bind:this={sentinel} class="h-1"></div>
    {/if}
  {/if}
</div>
