<script lang="ts">
  import type { PageData } from './$types'
  import Markdown from '$lib/components/Markdown.svelte'
  import { createArticlePageState } from './+page.svelte.ts'

  let { data }: { data: PageData } = $props()

  const state = createArticlePageState(data)
</script>

<svelte:head>
  <title>{state.getTitle()}</title>
  {#if data.article.seoDescription}
    <meta name="description" content={data.article.seoDescription} />
  {/if}
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/help/{data.collectionSlug}" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Back</a>

  <article class="mt-6">
    <h1 class="text-3xl font-bold text-gray-900">{state.getTitle()}</h1>

    {#if data.article.author}
      <p class="mt-2 text-sm text-gray-500">
        By {data.article.author.name}
        {#if data.article.publishedAt}
          &middot; {new Date(data.article.publishedAt).toLocaleDateString()}
        {/if}
      </p>
    {/if}

    <div class="mt-8">
      <Markdown content={data.article.translations?.[0]?.body} />
    </div>
  </article>

  <div class="mt-12 pt-8 border-t border-gray-200">
    {#if state.feedbackSent}
      <p class="text-sm text-gray-500">Thanks for your feedback!</p>
    {:else}
      <p class="text-sm font-medium text-gray-700">Was this article helpful?</p>
      <div class="mt-3 flex gap-3">
        <button
          onclick={() => state.sendFeedback(true)}
          class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          Yes
        </button>
        <button
          onclick={() => state.sendFeedback(false)}
          class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          No
        </button>
      </div>
    {/if}
  </div>
</div>
