<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Heedback</title>
  <meta name="description" content="Help center, feedback, and changelog" />
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-16">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900">How can we help?</h1>
    <p class="mt-4 text-lg text-gray-600">Search our help center, share feedback, or explore our roadmap.</p>

    <div class="mt-8 max-w-xl mx-auto">
      <input
        type="search"
        placeholder="Search articles..."
        class="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  </div>

  <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
    <a href="/help" class="block bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
      <div class="text-3xl mb-3">📚</div>
      <h2 class="text-lg font-semibold text-gray-900">Help Center</h2>
      <p class="mt-2 text-sm text-gray-500">Browse articles and guides</p>
    </a>

    <a href="/feedback" class="block bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
      <div class="text-3xl mb-3">💬</div>
      <h2 class="text-lg font-semibold text-gray-900">Feedback</h2>
      <p class="mt-2 text-sm text-gray-500">Share ideas and vote on features</p>
    </a>

    <a href="/changelog" class="block bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
      <div class="text-3xl mb-3">📢</div>
      <h2 class="text-lg font-semibold text-gray-900">Changelog</h2>
      <p class="mt-2 text-sm text-gray-500">See what's new and upcoming</p>
    </a>
  </div>
</div>
