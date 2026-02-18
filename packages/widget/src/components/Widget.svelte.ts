import { onMount } from 'svelte'
import { setApiBase, widgetApi } from '../api/widget-client'

export function createWidgetState(org: string, fallbackColor: string) {
  let isOpen = $state(false)
  let tab = $state<'chat' | 'help'>('chat')
  let boards = $state<any[]>([])
  let animating = $state(false)

  // Colors fetched from the org config API, with prop as fallback
  let brandColor = $state(fallbackColor)
  let widgetColor = $state(fallbackColor)

  onMount(() => {
    const scripts = document.querySelectorAll('script[data-org]')
    const script = scripts[scripts.length - 1] as HTMLScriptElement | undefined
    if (script?.src) {
      const url = new URL(script.src)
      setApiBase(url.origin)
    } else {
      setApiBase(window.location.origin)
    }

    widgetApi.getBoards(org).then((data) => {
      boards = data.data
    }).catch(() => {})

    // Fetch org-level colors so the widget matches admin settings
    widgetApi.getOrgConfig(org).then((data) => {
      brandColor = data.data.brandColor
      widgetColor = data.data.widgetColor
    }).catch(() => {})
  })

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
    open,
    close,
    toggle,
    switchTab,
  }
}
