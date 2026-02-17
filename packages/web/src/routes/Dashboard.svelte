<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { FileText, MessageSquare, Users } from 'lucide-svelte'
  import { Card, PageHeader } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  interface StatCard {
    label: string
    key: 'articles' | 'posts' | 'subscribers'
    icon: IconComponent
    color: string
  }

  let org = $state<{ name: string } | null>(null)
  let stats = $state({
    articles: 0,
    posts: 0,
    subscribers: 0,
  })

  currentOrg.subscribe((value) => {
    org = value
  })

  onMount(async () => {
    // Stats will be loaded from API when available
  })

  // Reactive so labels update when locale changes
  let statCards = $derived<StatCard[]>([
    { label: $_('dashboard.articles'), key: 'articles', icon: FileText, color: 'border-l-indigo-500' },
    { label: $_('dashboard.posts'), key: 'posts', icon: MessageSquare, color: 'border-l-emerald-500' },
    { label: $_('dashboard.subscribers'), key: 'subscribers', icon: Users, color: 'border-l-amber-500' },
  ])
</script>

<div>
  <PageHeader title={org?.name || $_('nav.dashboard')} subtitle={$_('dashboard.welcome')} />

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each statCards as card}
      <Card padding="md">
        <div class="border-l-4 {card.color} pl-4">
          <div class="flex items-center gap-2">
            <card.icon size={16} class="text-slate-400" />
            <p class="text-sm font-medium text-slate-500">{card.label}</p>
          </div>
          <p class="text-3xl font-semibold text-slate-900 mt-2">{stats[card.key]}</p>
        </div>
      </Card>
    {/each}
  </div>
</div>
