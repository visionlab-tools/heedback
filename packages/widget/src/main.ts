import { mount } from 'svelte'
import Widget from './components/Widget.svelte'

interface HeedbackConfig {
  org: string
  color?: string
  position?: 'bottom-right' | 'bottom-left'
  locale?: string
}

interface HeedbackUser {
  id?: string
  email?: string
  name?: string
  metadata?: Record<string, unknown>
}

interface HeedbackInstance {
  init: (config: HeedbackConfig) => void
  identify: (user: HeedbackUser) => void
  open: () => void
  close: () => void
  destroy: () => void
}

let container: HTMLElement | null = null
let widgetComponent: ReturnType<typeof mount> | null = null
let currentConfig: HeedbackConfig | null = null
let currentUser: HeedbackUser | null = null

const Heedback: HeedbackInstance = {
  init(config: HeedbackConfig) {
    currentConfig = config

    // Create shadow container
    container = document.createElement('div')
    container.id = 'heedback-widget'
    container.style.cssText = 'position: fixed; z-index: 999999;'
    document.body.appendChild(container)

    // Mount Svelte widget
    widgetComponent = mount(Widget, {
      target: container,
      props: {
        org: config.org,
        color: config.color || '#6366f1',
        position: config.position || 'bottom-right',
        locale: config.locale || 'en',
        user: currentUser,
      },
    })
  },

  identify(user: HeedbackUser) {
    currentUser = user
    // Widget will pick up user changes reactively
  },

  open() {
    container?.dispatchEvent(new CustomEvent('heedback:open'))
  },

  close() {
    container?.dispatchEvent(new CustomEvent('heedback:close'))
  },

  destroy() {
    if (container) {
      container.remove()
      container = null
      widgetComponent = null
    }
  },
}

// Auto-init from script data attributes
const script = document.currentScript as HTMLScriptElement | null
if (script) {
  const org = script.getAttribute('data-org')
  if (org) {
    Heedback.init({
      org,
      color: script.getAttribute('data-color') || '#6366f1',
      position: (script.getAttribute('data-position') as HeedbackConfig['position']) || 'bottom-right',
      locale: script.getAttribute('data-locale') || 'en',
    })
  }
}

// Expose globally
;(window as any).Heedback = Heedback

export default Heedback
