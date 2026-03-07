import { onMount } from 'svelte'
import { setApiBase, widgetApi } from '../api/widget-client'

/** Check unread count from localStorage without fetching API */
function computeInitialUnread(org: string, conversations: any[]): number {
  try {
    const seen: Record<string, string> = JSON.parse(
      localStorage.getItem(`heedback:${org}:seen`) || '{}'
    )
    return conversations.filter((c) => {
      if (c.lastMessageSenderType !== 'admin') return false
      const seenAt = seen[c.id]
      return !seenAt || c.lastMessageAt > seenAt
    }).length
  } catch {
    return 0
  }
}

export function createWidgetState(org: string, fallbackColor: string, apiUrl?: string, user?: any) {
  let isOpen = $state(false)
  let tab = $state<'chat' | 'help'>('chat')
  let boards = $state<any[]>([])
  let animating = $state(false)
  let initialUnreadCount = $state(0)

  // Colors fetched from the org config API, with prop as fallback
  let brandColor = $state(fallbackColor)
  let widgetColor = $state(fallbackColor)

  onMount(() => {
    if (apiUrl) {
      setApiBase(apiUrl)
    } else {
      // Fallback: derive from script src origin (only works when widget is served by the API)
      const scripts = document.querySelectorAll('script[data-org]')
      const script = scripts[scripts.length - 1] as HTMLScriptElement | undefined
      if (script?.src) {
        const url = new URL(script.src)
        setApiBase(url.origin)
      } else {
        setApiBase(window.location.origin)
      }
    }

    widgetApi.getBoards(org).then((data) => {
      boards = data.data
    }).catch(() => {})

    // Fetch org-level colors so the widget matches admin settings
    widgetApi.getOrgConfig(org).then((data) => {
      brandColor = data.data.brandColor
      widgetColor = data.data.widgetColor
    }).catch(() => {})

    // Pre-fetch unread count so badge shows before panel is opened
    prefetchUnread()
  })

  /** Resolve endUserId (localStorage or cross-domain) then fetch unread count */
  async function prefetchUnread() {
    let endUserId = localStorage.getItem(`heedback:${org}:endUserId`)

    // Cross-domain: resolve by external ID when no local endUserId
    if (!endUserId && user?.id) {
      try {
        const res = await widgetApi.resolveEndUser(org, user.id)
        endUserId = res.data.id
        localStorage.setItem(`heedback:${org}:endUserId`, endUserId)
      } catch {
        // 404 — user not yet created
      }
    }

    // Cookie-based cross-domain fallback (works in Chromium browsers)
    if (!endUserId) {
      try {
        const res = await widgetApi.whoami(org)
        endUserId = res.data.id
        localStorage.setItem(`heedback:${org}:endUserId`, endUserId)
      } catch {
        // No cookie or blocked by browser (Safari/Firefox)
      }
    }

    if (endUserId) {
      try {
        const data = await widgetApi.listConversations(org, endUserId)
        initialUnreadCount = computeInitialUnread(org, data.data)
      } catch {}
    }
  }

  function open() {
    if (animating) return
    animating = true
    isOpen = true
    setTimeout(() => { animating = false }, 300)
  }

  function close() {
    if (animating) return
    animating = true
    isOpen = false
    setTimeout(() => { animating = false }, 300)
  }

  function toggle() {
    if (isOpen) close()
    else open()
  }

  function switchTab(newTab: 'chat' | 'help') {
    tab = newTab
  }

  return {
    get isOpen() { return isOpen },
    get tab() { return tab },
    get boards() { return boards },
    get animating() { return animating },
    get brandColor() { return brandColor },
    get widgetColor() { return widgetColor },
    get initialUnreadCount() { return initialUnreadCount },
    open,
    close,
    toggle,
    switchTab,
  }
}
