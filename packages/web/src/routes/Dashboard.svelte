<script lang="ts">
  import { onMount } from 'svelte'
  import { Card, PageHeader } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { currentOrg } from '../lib/stores/org'

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
</script>

<div>
  <PageHeader title={org?.name || 'Dashboard'} subtitle="Welcome to your Heedback dashboard." />

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
    <Card padding="md">
      <p class="text-sm font-medium text-gray-500">Articles</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{stats.articles}</p>
    </Card>

    <Card padding="md">
      <p class="text-sm font-medium text-gray-500">Feedback Posts</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{stats.posts}</p>
    </Card>

    <Card padding="md">
      <p class="text-sm font-medium text-gray-500">Changelog Subscribers</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{stats.subscribers}</p>
    </Card>
  </div>
</div>
