<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { Badge, Button, PageHeader, DataTable, LoadingSpinner } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { navigate } from '../lib/router.svelte.ts'

  interface Conversation {
    id: string
    subject: string | null
    status: string
    channel: string
    messageCount: number
    createdAt: string
  }

  interface EndUserDetail {
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
    displayName: string | null
    avatarUrl: string | null
    position: string | null
    company: string | null
    pricingPlan: string | null
    language: string | null
    metadata: Record<string, string | number> | null
    createdAt: string
    conversations: Conversation[]
  }

  let { orgId, id }: { orgId: string; id: string } = $props()

  let endUser = $state<EndUserDetail | null>(null)
  let loading = $state(true)

  async function fetchEndUser() {
    loading = true
    try {
      const res = await api.get<{ data: EndUserDetail }>(`/org/${orgId}/end-users/${id}`)
      endUser = res.data
    } finally {
      loading = false
    }
  }

  onMount(fetchEndUser)

  function displayName(user: EndUserDetail): string {
    return user.displayName || user.email || $_('common.anonymous')
  }

  function initial(user: EndUserDetail): string {
    return (user.displayName || user.email || '?')[0].toUpperCase()
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString()
  }

  type BadgeVariant = 'success' | 'warning' | 'neutral'

  function statusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      open: 'warning',
      assigned: 'neutral',
      resolved: 'success',
      closed: 'neutral',
    }
    return map[status] || 'neutral'
  }

  let convoColumns = $derived([
    { label: $_('contact_detail.col_subject') },
    { label: $_('contact_detail.col_status') },
    { label: $_('contact_detail.col_messages'), align: 'right' as const },
    { label: $_('contact_detail.col_created') },
  ])
</script>

{#if loading}
  <LoadingSpinner />
{:else if endUser}
  <div>
    <PageHeader title={displayName(endUser)} subtitle={endUser.email ?? ''}>
      {#snippet actions()}
        <Button variant="ghost" size="sm" onclick={() => navigate(`/${orgId}/contacts`)}>
          {$_('contact_detail.back')}
        </Button>
      {/snippet}
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Profile card -->
      <div class="bg-white rounded-lg border border-slate-200 p-6">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          {$_('contact_detail.profile')}
        </h3>

        <div class="flex items-center gap-3 mb-4">
          {#if endUser.avatarUrl}
            <img src={endUser.avatarUrl} alt="" class="w-12 h-12 rounded-full object-cover" />
          {:else}
            <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
              {initial(endUser)}
            </div>
          {/if}
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{displayName(endUser)}</p>
            {#if endUser.email}
              <p class="text-xs text-slate-500 truncate">{endUser.email}</p>
            {/if}
          </div>
        </div>

        <div class="space-y-2 text-sm">
          {#if endUser.position}
            <div class="flex justify-between">
              <span class="text-slate-500">{$_('conversation.position')}</span>
              <span class="text-slate-700">{endUser.position}</span>
            </div>
          {/if}
          {#if endUser.company}
            <div class="flex justify-between">
              <span class="text-slate-500">{$_('conversation.company')}</span>
              <span class="text-slate-700">{endUser.company}</span>
            </div>
          {/if}
          {#if endUser.pricingPlan}
            <div class="flex justify-between">
              <span class="text-slate-500">{$_('conversation.pricing_plan')}</span>
              <span class="text-slate-700">{endUser.pricingPlan}</span>
            </div>
          {/if}
          {#if endUser.language}
            <div class="flex justify-between">
              <span class="text-slate-500">{$_('conversation.language')}</span>
              <span class="text-slate-700">{endUser.language}</span>
            </div>
          {/if}
          <div class="flex justify-between">
            <span class="text-slate-500">{$_('conversation.created')}</span>
            <span class="text-slate-700">{formatDate(endUser.createdAt)}</span>
          </div>
        </div>

        {#if endUser.metadata && Object.keys(endUser.metadata).length > 0}
          <div class="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {$_('conversation.metadata')}
            </span>
            {#each Object.entries(endUser.metadata) as [key, value]}
              <div class="flex justify-between">
                <span class="text-slate-500">{key}</span>
                <span class="text-slate-700">{value}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Conversations -->
      <div class="lg:col-span-2">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          {$_('contact_detail.conversations')}
        </h3>

        {#if endUser.conversations.length === 0}
          <p class="text-sm text-slate-500">{$_('contact_detail.no_conversations')}</p>
        {:else}
          <DataTable columns={convoColumns}>
            {#each endUser.conversations as convo}
              <tr
                class="hover:bg-slate-50 transition-colors cursor-pointer"
                onclick={() => navigate(`/${orgId}/inbox/${convo.id}`)}
              >
                <td class="px-6 py-4 text-sm font-medium text-slate-900">
                  {convo.subject || $_('inbox.no_subject')}
                </td>
                <td class="px-6 py-4">
                  <Badge variant={statusVariant(convo.status)}>{convo.status}</Badge>
                </td>
                <td class="px-6 py-4 text-sm text-slate-500 text-right">{convo.messageCount}</td>
                <td class="px-6 py-4 text-sm text-slate-500">{formatDate(convo.createdAt)}</td>
              </tr>
            {/each}
          </DataTable>
        {/if}
      </div>
    </div>
  </div>
{/if}
