import { writable } from 'svelte/store'
import { api } from '../api/client'

/**
 * Tracks unread (open) conversation count for the current org.
 * Updates document.title with the count.
 */
function createInboxStore() {
  const { subscribe, set, update } = writable(0)

  let eventSource: EventSource | null = null
  let currentOrgId = ''
  const baseTitle = 'Heedback'

  function updateTitle(count: number) {
    document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle
  }

  return {
    subscribe,

    /** Load the initial unread count and connect SSE */
    async connect(orgId: string) {
      if (currentOrgId === orgId && eventSource) return
      this.disconnect()
      currentOrgId = orgId

      try {
        const data = await api.get<{ data: any[]; meta: { total: number } }>(
          `/org/${orgId}/conversations?status=open&limit=1`,
          { silent: true },
        )
        const count = data.meta?.total ?? data.data.length
        set(count)
        updateTitle(count)
      } catch {
        set(0)
      }

      this.connectSse(orgId)
    },

    connectSse(orgId: string) {
      const url = `/api/v1/org/${orgId}/sse/inbox`
      const es = new EventSource(url, { withCredentials: true })

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data)

          // New conversation from end-user → increment
          if (event.event === 'conversation.created') {
            update((n) => {
              const next = n + 1
              updateTitle(next)
              return next
            })
          }

          // Status change → recalculate based on old/new status
          if (event.event === 'conversation.updated') {
            const newStatus = event.data?.status
            // If resolved/closed → decrement, if opened → increment
            if (newStatus === 'resolved' || newStatus === 'closed') {
              update((n) => {
                const next = Math.max(0, n - 1)
                updateTitle(next)
                return next
              })
            }
          }
        } catch {
          // Ignore malformed SSE data
        }
      }

      eventSource = es
    },

    disconnect() {
      eventSource?.close()
      eventSource = null
      currentOrgId = ''
    },

    /** Manually decrement when an admin resolves/closes a conversation */
    decrement() {
      update((n) => {
        const next = Math.max(0, n - 1)
        updateTitle(next)
        return next
      })
    },

    /** Force refresh count from API */
    async refresh(orgId: string) {
      try {
        const data = await api.get<{ data: any[]; meta: { total: number } }>(
          `/org/${orgId}/conversations?status=open&limit=1`,
          { silent: true },
        )
        const count = data.meta?.total ?? data.data.length
        set(count)
        updateTitle(count)
      } catch {
        // Keep current count
      }
    },
  }
}

export const inboxUnread = createInboxStore()
