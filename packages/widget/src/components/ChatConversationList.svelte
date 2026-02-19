<script lang="ts">
  import { t } from '../lib/i18n'

  let {
    conversations,
    locale = 'en',
    color = '#6366f1',
    onSelect,
    onNew,
  }: {
    conversations: any[]
    locale?: string
    color?: string
    onSelect: (id: string) => void
    onNew: () => void
  } = $props()
</script>

<div class="hb-conv-list">
  <button class="hb-conv-new-btn" style="background: {color};" onclick={onNew}>
    + {t(locale, 'chat.new_conversation')}
  </button>

  {#if conversations.length === 0}
    <p class="hb-conv-empty">{t(locale, 'chat.no_conversations')}</p>
  {:else}
    {#each conversations as convo}
      <button class="hb-conv-card" onclick={() => onSelect(convo.id)}>
        <div class="hb-conv-card-row">
          <span class="hb-conv-status" class:hb-conv-status-open={convo.status === 'open' || convo.status === 'assigned'}
            class:hb-conv-status-resolved={convo.status === 'resolved' || convo.status === 'closed'}></span>
          <span class="hb-conv-date">
            {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleDateString() : ''}
          </span>
        </div>
        <p class="hb-conv-preview">{convo.subject || convo.channel || 'Conversation'}</p>
      </button>
    {/each}
  {/if}
</div>

<style>
  .hb-conv-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    overflow-y: auto;
  }
  .hb-conv-new-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    transition: opacity 0.15s;
  }
  .hb-conv-new-btn:hover { opacity: 0.9; }
  .hb-conv-empty {
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
    padding: 16px 0;
  }
  .hb-conv-card {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    transition: border-color 0.15s;
    font-family: inherit;
  }
  .hb-conv-card:hover { border-color: #a5b4fc; }
  .hb-conv-card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hb-conv-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
  }
  .hb-conv-status-open { background: #22c55e; }
  .hb-conv-status-resolved { background: #6b7280; }
  .hb-conv-date { font-size: 11px; color: #9ca3af; }
  .hb-conv-preview {
    margin: 4px 0 0;
    font-size: 13px;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
