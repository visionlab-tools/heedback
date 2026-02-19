import { widgetApi, connectSSE } from '../api/widget-client'

type Screen = 'loading' | 'list' | 'new' | 'thread'

/** localStorage key for persisting the end-user ID across sessions */
function storageKey(org: string) {
  return `heedback:${org}:endUserId`
}

export function createChatViewState(org: string, user: any) {
  let screen = $state<Screen>('loading')
  let endUserId = $state<string | null>(null)
  let conversations = $state<any[]>([])
  let conversationId = $state<string | null>(null)
  let messages = $state<any[]>([])
  let newMessage = $state('')
  let sending = $state(false)
  let disconnectSse = $state<(() => void) | null>(null)

  /** Bootstrap: check localStorage for existing end user */
  async function init() {
    const stored = localStorage.getItem(storageKey(org))
    if (stored) {
      endUserId = stored
      await refreshConversations()
      screen = conversations.length > 0 ? 'list' : 'new'
    } else {
      screen = 'new'
    }
  }

  async function refreshConversations() {
    if (!endUserId) return
    try {
      const data = await widgetApi.listConversations(org, endUserId)
      conversations = data.data
    } catch {
      conversations = []
    }
  }

  function connectToConversation(id: string) {
    disconnectSse?.()
    disconnectSse = connectSSE(org, id, (event) => {
      if (event.event === 'message.created') {
        // Deduplicate by ID
        if (!messages.some((m) => m.id === event.data.id)) {
          messages = [...messages, event.data]
        }
      }
    })
  }

  async function handleStart(e: Event) {
    e.preventDefault()
    if (!newMessage.trim()) return
    sending = true
    try {
      const data = await widgetApi.startConversation(org, {
        body: newMessage,
        channel: 'widget',
        endUserId: endUserId ?? undefined,
        endUserExternalId: user?.id,
        endUserFirstName: user?.firstName,
        endUserLastName: user?.lastName,
        endUserEmail: user?.email,
        endUserAvatarUrl: user?.avatarUrl,
      })

      // Persist the end-user ID for future sessions
      const conv = data.data
      if (conv.endUserId) {
        endUserId = conv.endUserId
        localStorage.setItem(storageKey(org), conv.endUserId)
      }

      conversationId = conv.id
      messages = [
        {
          id: 'initial',
          senderType: 'end_user',
          body: newMessage,
          createdAt: new Date().toISOString(),
          sender: null,
        },
      ]
      newMessage = ''
      screen = 'thread'
      connectToConversation(conv.id)
    } catch {
      // Silently handle errors
    } finally {
      sending = false
    }
  }

  async function openConversation(id: string) {
    conversationId = id
    screen = 'thread'
    try {
      const data = await widgetApi.getConversation(org, id)
      messages = data.data.messages || []
      connectToConversation(id)
    } catch {
      messages = []
    }
  }

  async function handleReply(e: Event) {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || sending) return
    sending = true
    try {
      const data = await widgetApi.replyToConversation(org, conversationId, {
        body: newMessage,
      })
      // Append locally — SSE may also deliver it (deduplicate in listener)
      if (!messages.some((m) => m.id === data.data.id)) {
        messages = [...messages, data.data]
      }
      newMessage = ''
    } catch {
      // Silently handle errors
    } finally {
      sending = false
    }
  }

  function goToList() {
    disconnectSse?.()
    disconnectSse = null
    conversationId = null
    messages = []
    refreshConversations()
    screen = 'list'
  }

  function goToNew() {
    disconnectSse?.()
    disconnectSse = null
    conversationId = null
    messages = []
    screen = 'new'
  }

  function cleanup() {
    disconnectSse?.()
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return {
    get screen() { return screen },
    get endUserId() { return endUserId },
    get conversations() { return conversations },
    get conversationId() { return conversationId },
    get messages() { return messages },
    get newMessage() { return newMessage },
    set newMessage(v: string) { newMessage = v },
    get sending() { return sending },
    init,
    handleStart,
    handleReply,
    openConversation,
    goToList,
    goToNew,
    cleanup,
    formatTime,
  }
}
