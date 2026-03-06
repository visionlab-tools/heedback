<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/stores'
  import type { PageData } from './$types'
  import Markdown from '$lib/components/Markdown.svelte'
  import { createChangelogPageState } from './page-state.svelte'

  let { data }: { data: PageData } = $props()

  const state = createChangelogPageState(data)
</script>

<svelte:head>
  <title>{state.getTitle()} - {$_('changelog.title')}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/{$page.params.locale}/changelog" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; {$_('changelog.back')}</a>

  <article class="mt-6">
    {#if data.entry.publishedAt}
      <time class="text-sm text-gray-400">
        {new Date(data.entry.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
    {/if}

    <div class="mt-2 flex items-center gap-2">
      {#each data.entry.labels || [] as label}
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {state.labelBadgeClass(label)}">
          {label}
        </span>
      {/each}
    </div>

    <h1 class="mt-3 text-3xl font-bold text-gray-900">{state.getTitle()}</h1>

    {#if data.entry.author}
      <p class="mt-2 text-sm text-gray-500">{$_('changelog.by_author', { values: { author: data.entry.author.name } })}</p>
    {/if}

    <div class="mt-8">
      <Markdown content={data.entry.translations?.[0]?.body} />
    </div>

    {#if data.entry.linkedPosts?.length}
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">{$_('changelog.related_posts')}</h3>
        <ul class="mt-2 space-y-2">
          {#each data.entry.linkedPosts as post}
            <li>
              <a href="/{$page.params.locale}/feedback/{post.id}" class="text-indigo-600 hover:text-indigo-800 text-sm">
                {post.title} ({$_('feedback.votes', { values: { count: post.voteCount } })})
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </article>
</div>
