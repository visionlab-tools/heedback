import { onMount } from 'svelte'
import { setApiBase, widgetApi } from '../api/widget-client'

export function createWidgetState(org: string) {
  let isOpen = $state(false)
  let tab = $state<'feedback' | 'chat'>('feedback')
  let view = $state<'list' | 'form'>('list')
  let boards = $state<any[]>([])

  const positionStyles: Record<string, string> = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
  }

  onMount(() => {
    // Resolve API base from the script source
    const scripts = document.querySelectorAll('script[data-org]')
    const script = scripts[scripts.length - 1] as HTMLScriptElement | undefined
    if (script?.src) {
      const url = new URL(script.src)
      setApiBase(url.origin)
    } else {
      setApiBase(window.location.origin)
    }

    // Load boards
    widgetApi.getBoards(org).then((data) => {
      boards = data.data
    }).catch(() => {})
  })

  function toggle() {
    isOpen = !isOpen
  }

  function switchToForm() {
    view = 'form'
  }

  function switchToList() {
    view = 'list'
  }

  function switchTab(newTab: 'feedback' | 'chat') {
    tab = newTab
    if (newTab === 'feedback') {
      view = 'list'
    }
  }

  return {
    get isOpen() { return isOpen },
    get tab() { return tab },
    get view() { return view },
    get boards() { return boards },
    positionStyles,
    toggle,
    switchToForm,
    switchToList,
    switchTab,
  }
}
