<script lang="ts">
  import { renderMarkdown } from '../utils/markdown'
  import { createHelpViewState } from './HelpView.svelte.ts'

  let { org }: { org: string } = $props()

  const state = createHelpViewState(org)
</script>

<div class="hb-help">
  {#if state.view === 'article' && state.selectedArticle}
    <!-- Article detail -->
    <button class="hb-help-back" onclick={state.goBack}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
      Back
    </button>
    <h2 class="hb-help-article-title">{state.selectedArticle.title}</h2>
    <div class="hb-help-article-body">
      {@html renderMarkdown(state.selectedArticle.body)}
    </div>
  {:else}
    <!-- Search -->
    <div class="hb-help-search-wrap">
      <svg class="hb-help-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
      <input
        type="search"
        placeholder="Search help articles..."
        bind:value={state.search}
        oninput={state.handleSearch}
        class="hb-help-search"
      />
    </div>

    {#if state.loading || state.searching}
      <div class="hb-help-loading">
        <div class="hb-help-spinner"></div>
        <span>Loading...</span>
      </div>
    {:else if state.view === 'search'}
      <!-- Search results -->
      {#if state.searchResults.length === 0}
        <div class="hb-help-empty">No articles found.</div>
      {:else}
        <div class="hb-help-list">
          {#each state.searchResults as article}
            <button class="hb-help-item" onclick={() => state.openArticle(article.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>{article.title}</span>
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Collections list -->
      {#if state.collections.length === 0}
        <div class="hb-help-empty">No help articles available yet.</div>
      {:else}
        <div class="hb-help-collections">
          {#each state.collections as collection}
            <div class="hb-help-collection">
              <div class="hb-help-collection-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{collection.name || collection.title}</span>
              </div>
              {#if collection.articles?.length > 0}
                <div class="hb-help-collection-articles">
                  {#each collection.articles as article}
                    <button class="hb-help-item" onclick={() => state.openArticle(article.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span>{article.title}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .hb-help {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
  }
  .hb-help-search-wrap {
    position: relative;
  }
  .hb-help-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
  }
  .hb-help-search {
    width: 100%;
    padding: 9px 12px 9px 34px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    background: #f9fafb;
    transition: border-color 0.2s, background 0.2s;
    font-family: inherit;
  }
  .hb-help-search:focus {
    border-color: #a5b4fc;
    background: white;
  }
  .hb-help-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 0;
    color: #9ca3af;
    font-size: 13px;
  }
  .hb-help-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: hb-spin 0.6s linear infinite;
  }
  @keyframes hb-spin {
    to { transform: rotate(360deg); }
  }
  .hb-help-empty {
    text-align: center;
    color: #9ca3af;
    padding: 32px 0;
    font-size: 13px;
  }
  .hb-help-list, .hb-help-collections {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hb-help-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    font-size: 13px;
    color: #374151;
    text-align: left;
    transition: background 0.15s;
    font-family: inherit;
    width: 100%;
  }
  .hb-help-item:hover {
    background: #f3f4f6;
  }
  .hb-help-item svg {
    flex-shrink: 0;
    color: #9ca3af;
  }
  .hb-help-collection {
    margin-bottom: 8px;
  }
  .hb-help-collection-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .hb-help-collection-header svg {
    color: #9ca3af;
  }
  .hb-help-collection-articles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 8px;
  }
  .hb-help-back {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 13px;
    color: #6366f1;
    font-weight: 500;
    border-radius: 6px;
    transition: background 0.15s;
    font-family: inherit;
    margin: 0 0 4px -10px;
  }
  .hb-help-back:hover {
    background: #eef2ff;
  }
  .hb-help-article-title {
    font-size: 17px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 12px;
    line-height: 1.3;
  }
  .hb-help-article-body {
    font-size: 13px;
    line-height: 1.65;
    color: #374151;
  }
  .hb-help-article-body :global(h1),
  .hb-help-article-body :global(h2),
  .hb-help-article-body :global(h3) {
    color: #111827;
    margin: 16px 0 8px;
    line-height: 1.3;
  }
  .hb-help-article-body :global(h1) { font-size: 16px; }
  .hb-help-article-body :global(h2) { font-size: 15px; }
  .hb-help-article-body :global(h3) { font-size: 14px; }
  .hb-help-article-body :global(p) { margin: 0 0 10px; }
  .hb-help-article-body :global(a) { color: #6366f1; }
  .hb-help-article-body :global(code) {
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
  }
  .hb-help-article-body :global(pre) {
    background: #f3f4f6;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 12px;
  }
  .hb-help-article-body :global(ul),
  .hb-help-article-body :global(ol) {
    padding-left: 20px;
    margin: 0 0 10px;
  }
</style>
