<script lang="ts">
  import { t } from '../lib/i18n'
  import ChatView from './ChatView.svelte'
  import HelpView from './HelpView.svelte'
  import { createWidgetState } from './Widget.svelte.ts'

  let {
    org,
    color = '#6366f1',
    position = 'bottom-right',
    locale = 'en',
    user = null,
  }: {
    org: string
    color?: string
    position?: string
    locale?: string
    user?: any
  } = $props()

  const widget = createWidgetState(org, color)
  let helpArticleOpen = $state(false)
</script>

<div
  class="hb-root"
  class:hb-left={position === 'bottom-left'}
>
  <!-- Panel -->
  {#if widget.isOpen}
    <div class="hb-panel" class:hb-panel-closing={widget.animating && !widget.isOpen} class:hb-article-open={widget.tab === 'help' && helpArticleOpen}>
      <!-- Header uses brandColor for consistency with the org identity -->
      <div class="hb-header" style="background: linear-gradient(135deg, {widget.brandColor}, {widget.brandColor}dd);">
        <div class="hb-header-top">
          <div class="hb-header-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="hb-header-title">{t(locale, 'header.title')}</span>
          </div>
          <button class="hb-close-btn" onclick={widget.close} aria-label={t(locale, 'trigger.close')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p class="hb-header-subtitle">{t(locale, 'header.subtitle')}</p>

        <!-- Tabs -->
        <div class="hb-tabs">
          <button
            class="hb-tab"
            class:hb-tab-active={widget.tab === 'chat'}
            onclick={() => widget.switchTab('chat')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {t(locale, 'tabs.chat')}
          </button>
          <button
            class="hb-tab"
            class:hb-tab-active={widget.tab === 'help'}
            onclick={() => widget.switchTab('help')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            {t(locale, 'tabs.help')}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="hb-content">
        {#if widget.tab === 'chat'}
          <ChatView {org} {user} color={widget.brandColor} {locale} />
        {:else}
          <HelpView {org} {locale} onviewchange={(v) => helpArticleOpen = v === 'article'} />
        {/if}
      </div>
    </div>
  {/if}

  <!-- Trigger button uses widgetColor (independently customizable) -->
  <button
    class="hb-trigger"
    class:hb-trigger-open={widget.isOpen}
    style="background: linear-gradient(135deg, {widget.widgetColor}, {widget.widgetColor}dd);"
    onclick={widget.toggle}
    aria-label={widget.isOpen ? t(locale, 'trigger.close') : t(locale, 'trigger.open')}
  >
    {#if widget.isOpen}
      <svg class="hb-trigger-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    {:else}
      <svg class="hb-trigger-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    {/if}
  </button>
</div>

<style>
  /* Reset & root */
  .hb-root {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #111827;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .hb-root.hb-left {
    right: auto;
    left: 20px;
    align-items: flex-start;
  }
  .hb-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Panel */
  .hb-panel {
    width: 400px;
    max-height: min(600px, calc(100vh - 120px));
    background: #ffffff;
    border-radius: 16px;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin-bottom: 14px;
    animation: hb-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    transition: width 0.25s ease, max-height 0.25s ease;
  }
  /* 1.5x larger when reading an article for better readability */
  .hb-panel.hb-article-open {
    width: 600px;
    max-height: min(900px, calc(100vh - 80px));
  }
  @keyframes hb-slide-up {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Header */
  .hb-header {
    padding: 18px 20px 0;
    color: white;
  }
  .hb-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hb-header-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hb-header-title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .hb-header-subtitle {
    margin-top: 6px;
    font-size: 13px;
    opacity: 0.85;
    font-weight: 400;
  }
  .hb-close-btn {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .hb-close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Tabs */
  .hb-tabs {
    display: flex;
    gap: 4px;
    margin-top: 14px;
  }
  .hb-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    font-family: inherit;
  }
  .hb-tab:hover {
    color: rgba(255, 255, 255, 0.85);
  }
  .hb-tab-active {
    color: white;
    border-bottom-color: white;
  }

  /* Content */
  .hb-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    min-height: 300px;
    max-height: min(420px, calc(100vh - 280px));
    transition: max-height 0.25s ease;
  }
  .hb-article-open .hb-content {
    max-height: min(720px, calc(100vh - 260px));
  }
  .hb-content::-webkit-scrollbar {
    width: 4px;
  }
  .hb-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .hb-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  /* Trigger button */
  .hb-trigger {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.18),
      0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    flex-shrink: 0;
  }
  .hb-trigger:hover {
    transform: scale(1.08);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .hb-trigger:active {
    transform: scale(0.95);
  }
  .hb-trigger-icon {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hb-trigger-open .hb-trigger-icon {
    transform: rotate(90deg);
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .hb-root {
      bottom: 12px;
      right: 12px;
    }
    .hb-root.hb-left {
      left: 12px;
    }
    .hb-panel {
      width: calc(100vw - 24px);
      max-height: calc(100vh - 100px);
    }
    .hb-panel.hb-article-open {
      width: calc(100vw - 24px);
    }
  }
</style>
