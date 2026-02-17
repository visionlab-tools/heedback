import { mount, unmount } from 'svelte'
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
let widgetComponent: Record<string, any> | null = null
let currentConfig: HeedbackConfig | null = null
let currentUser: HeedbackUser | null = null

const Heedback: HeedbackInstance = {
  init(config: HeedbackConfig) {
    if (container) return // Already initialized

    currentConfig = config

    // Create container
    container = document.createElement('div')
    container.id = 'heedback-widget'
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
    // Re-mount widget with new user data if already initialized
    if (container && currentConfig) {
      if (widgetComponent) {
        unmount(widgetComponent)
      }
      widgetComponent = mount(Widget, {
        target: container,
        props: {
          org: currentConfig.org,
          color: currentConfig.color || '#6366f1',
          position: currentConfig.position || 'bottom-right',
          locale: currentConfig.locale || 'en',
          user: currentUser,
        },
      })
    }
  },

  open() {
    container?.dispatchEvent(new CustomEvent('heedback:open'))
  },

  close() {
    container?.dispatchEvent(new CustomEvent('heedback:close'))
  },

  destroy() {
    if (widgetComponent) {
      unmount(widgetComponent)
      widgetComponent = null
    }
    if (container) {
      container.remove()
      container = null
    }
    currentConfig = null
    currentUser = null
  },
}

// Auto-init from script data attributes
// Usage: <script src="https://your-api.com/widget.js" data-org="my-org" data-color="#6366f1"></script>
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

    // Auto-identify if user data is provided
    const userEmail = script.getAttribute('data-user-email')
    const userName = script.getAttribute('data-user-name')
    const userId = script.getAttribute('data-user-id')
    if (userEmail || userName || userId) {
      Heedback.identify({
        id: userId || undefined,
        email: userEmail || undefined,
        name: userName || undefined,
      })
    }
  }
}

// Expose globally
;(window as any).Heedback = Heedback

export default Heedback
