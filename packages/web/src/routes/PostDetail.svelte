<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Badge, Select, Textarea, Card, Checkbox, LoadingSpinner } from '@heedback/ui-kit'
  import Markdown from '../lib/components/Markdown.svelte'
  import { createPostDetailState } from './PostDetail.svelte.ts'

  let { id }: { id: string } = $props()

  const state = createPostDetailState(id)

  onMount(state.load)
</script>

<div class="max-w-4xl">
  {#if state.loading}
    <LoadingSpinner />
  {:else if state.post}
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{state.post.title}</h1>
        <p class="mt-1 text-sm text-gray-500">
          by {state.post.author?.name || 'Anonymous'} · {state.post.voteCount} votes
        </p>
      </div>
      <Button variant="danger" onclick={state.handleDelete} size="sm">Delete</Button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <Select bind:value={state.newStatus} onchange={state.handleStatusChange}>
        <option value="open">Open</option>
        <option value="under_review">Under Review</option>
        <option value="planned">Planned</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="closed">Closed</option>
      </Select>
    </div>

    <Card padding="md">
      <Markdown content={state.post.body} />
    </Card>

    {#if state.post.tags?.length}
      <div class="mt-4 flex gap-2">
        {#each state.post.tags as tag}
          <Badge variant="neutral">
            <span style="color: {tag.color}">{tag.name}</span>
          </Badge>
        {/each}
      </div>
    {/if}

    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-900">Comments ({state.comments.length})</h2>

      <div class="mt-4 space-y-4">
        {#each state.comments as comment}
          <div class="bg-white p-4 rounded-xl border {comment.isInternal ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="font-medium text-gray-900">{comment.author?.name || 'Anonymous'}</span>
              {#if comment.isInternal}
                <Badge variant="warning">Internal</Badge>
              {/if}
            </div>
            <div class="mt-1"><Markdown content={comment.body} /></div>
          </div>
        {/each}
      </div>

      <form onsubmit={state.handleAddComment} class="mt-6">
        <Textarea bind:value={state.newComment} rows={3} placeholder="Add a comment..." />
        <div class="mt-3 flex items-center gap-4">
          <Button type="submit" size="sm">Add Comment</Button>
          <Checkbox label="Internal note" bind:checked={state.isInternal} />
        </div>
      </form>
    </div>
  {/if}
</div>
