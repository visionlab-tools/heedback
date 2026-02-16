<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  function getTitle(): string {
    return data.entry.translations?.[0]?.title || 'Untitled'
  }

  function getBody(): string {
    return data.entry.translations?.[0]?.body || ''
  }

  function labelBadgeClass(label: string): string {
    const map: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      improvement: 'bg-blue-100 text-blue-800',
      fix: 'bg-orange-100 text-orange-800',
      breaking: 'bg-red-100 text-red-800',
    }
    return map[label] || 'bg-gray-100 text-gray-800'
  }
</script>

<svelte:head>
  <title>{getTitle()} - Changelog</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
  <a href="/changelog" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to Changelog</a>

  <article class="mt-6">
    {#if data.entry.publishedAt}
      <time class="text-sm text-gray-400">
        {new Date(data.entry.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
    {/if}

    <div class="mt-2 flex items-center gap-2">
      {#each data.entry.labels || [] as label}
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {labelBadgeClass(label)}">
          {label}
        </span>
      {/each}
    </div>

    <h1 class="mt-3 text-3xl font-bold text-gray-900">{getTitle()}</h1>

    {#if data.entry.author}
      <p class="mt-2 text-sm text-gray-500">By {data.entry.author.name}</p>
    {/if}

    <div class="mt-8 prose prose-gray max-w-none">
      {@html getBody()}
    </div>

    {#if data.entry.linkedPosts?.length}
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">Related feedback posts</h3>
        <ul class="mt-2 space-y-2">
          {#each data.entry.linkedPosts as post}
            <li>
              <a href="/feedback/{post.id}" class="text-indigo-600 hover:text-indigo-800 text-sm">
                {post.title} ({post.voteCount} votes)
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </article>
</div>
