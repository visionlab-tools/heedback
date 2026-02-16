<script lang="ts">
  import { onMount } from 'svelte'
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
  <h1 class="text-2xl font-bold text-gray-900">
    {org?.name || 'Dashboard'}
  </h1>
  <p class="mt-1 text-sm text-gray-500">Welcome to your Heedback dashboard.</p>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p class="text-sm font-medium text-gray-500">Articles</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{stats.articles}</p>
    </div>

    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p class="text-sm font-medium text-gray-500">Feedback Posts</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{stats.posts}</p>
    </div>

    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p class="text-sm font-medium text-gray-500">Changelog Subscribers</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{stats.subscribers}</p>
    </div>
  </div>
</div>
