<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
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
        <h1 class="text-2xl font-semibold text-slate-900">{state.post.title}</h1>
        <p class="mt-1 text-sm text-slate-500">
          {$_('posts.by_author', { values: { author: state.post.author?.name || $_('common.anonymous') } })} · {$_('posts.votes', { values: { count: state.post.voteCount } })}
        </p>
      </div>
      <Button variant="danger" onclick={state.handleDelete} size="sm">{$_('common.delete')}</Button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <Select bind:value={state.newStatus} onchange={state.handleStatusChange}>
        <option value="open">{$_('posts.status_open')}</option>
        <option value="under_review">{$_('posts.status_under_review')}</option>
        <option value="planned">{$_('posts.status_planned')}</option>
        <option value="in_progress">{$_('posts.status_in_progress')}</option>
        <option value="completed">{$_('posts.status_completed')}</option>
        <option value="closed">{$_('posts.status_closed')}</option>
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
      <h2 class="text-lg font-semibold text-slate-900">{$_('post_detail.comments', { values: { count: state.comments.length } })}</h2>

      <div class="mt-4 space-y-4">
        {#each state.comments as comment}
          <div class="p-4 rounded-lg border {comment.isInternal ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}">
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <span class="font-medium text-slate-900">{comment.author?.name || $_('common.anonymous')}</span>
              {#if comment.isInternal}
                <Badge variant="warning">{$_('post_detail.internal')}</Badge>
              {/if}
            </div>
            <div class="mt-1"><Markdown content={comment.body} /></div>
          </div>
        {/each}
      </div>

      <form onsubmit={state.handleAddComment} class="mt-6">
        <Textarea bind:value={state.newComment} rows={3} placeholder={$_('post_detail.comment_placeholder')} />
        <div class="mt-3 flex items-center gap-4">
          <Button type="submit" size="sm">{$_('post_detail.add_comment')}</Button>
          <Checkbox label={$_('post_detail.internal_note')} bind:checked={state.isInternal} />
        </div>
      </form>
    </div>
  {/if}
</div>
