<script lang="ts">
  import type { PageData } from './$types'
  import Markdown from '$lib/components/Markdown.svelte'
  import { createFeedbackPostState } from './+page.svelte.ts'

  let { data }: { data: PageData } = $props()

  const state = createFeedbackPostState()
</script>

<svelte:head>
  <title>{data.post.title} - Feedback</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/feedback" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to Feedback</a>

  <div class="mt-6 flex items-start gap-6">
    <div class="flex flex-col items-center min-w-[56px] bg-gray-50 rounded-xl py-3 px-2">
      <button class="text-xl text-gray-400 hover:text-indigo-600">&#9650;</button>
      <span class="text-lg font-bold text-gray-900">{data.post.voteCount}</span>
      <span class="text-xs text-gray-400">votes</span>
    </div>

    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {state.statusBadgeClass(data.post.status)}">
          {data.post.status.replace('_', ' ')}
        </span>
        {#if data.post.board}
          <span class="text-xs text-gray-400">{data.post.board.name}</span>
        {/if}
      </div>

      <h1 class="mt-2 text-2xl font-bold text-gray-900">{data.post.title}</h1>

      <p class="mt-2 text-sm text-gray-500">
        by {data.post.author?.name || 'Anonymous'}
      </p>

      <div class="mt-4">
        <Markdown content={data.post.body} />
      </div>

      {#if data.post.tags?.length}
        <div class="mt-4 flex gap-2">
          {#each data.post.tags as tag}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style="background-color: {tag.color}20; color: {tag.color}">
              {tag.name}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="mt-12">
    <h2 class="text-lg font-semibold text-gray-900">Comments ({data.comments.length})</h2>

    <div class="mt-4 space-y-4">
      {#each data.comments as comment}
        <div class="bg-white p-4 rounded-xl border border-gray-200">
          <div class="text-sm">
            <span class="font-medium text-gray-900">{comment.author?.name || 'Anonymous'}</span>
            {#if comment.author?.type === 'admin'}
              <span class="ml-1 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Team</span>
            {/if}
          </div>
          <div class="mt-1"><Markdown content={comment.body} /></div>
        </div>
      {/each}
    </div>

    {#if data.comments.length === 0}
      <p class="mt-4 text-sm text-gray-400">No comments yet.</p>
    {/if}
  </div>
</div>
