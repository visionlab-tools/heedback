import { widgetApi } from '../api/widget-client'

export function createChatViewState(org: string, user: any) {
  let conversationId = $state<string | null>(null)
  let messages = $state<any[]>([])
  let newMessage = $state('')
  let sending = $state(false)
  let loading = $state(false)
  let subject = $state('')
  let started = $state(false)

  async function handleStart(e: Event) {
    e.preventDefault()
    if (!newMessage.trim()) return
    sending = true
    try {
      const data = await widgetApi.startConversation(org, {
        subject: subject || undefined,
        body: newMessage,
        channel: 'widget',
        endUserEmail: user?.email,
        endUserName: user?.name,
      })
      conversationId = data.data.id
      started = true
      messages = [
        {
          id: 'initial',
          senderType: 'end_user',
          body: newMessage,
          createdAt: new Date().toISOString(),
        },
      ]
      newMessage = ''
      subject = ''
    } catch {
      // Handle error
    } finally {
      sending = false
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
      messages = [...messages, data.data]
      newMessage = ''
    } catch {
      // Handle error
    } finally {
      sending = false
    }
  }

  async function refreshMessages() {
    if (!conversationId) return
    loading = true
    try {
      const data = await widgetApi.getConversation(org, conversationId)
      messages = data.data.messages || []
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return {
    get conversationId() { return conversationId },
    get messages() { return messages },
    get newMessage() { return newMessage },
    set newMessage(v: string) { newMessage = v },
    get sending() { return sending },
    get loading() { return loading },
    get subject() { return subject },
    set subject(v: string) { subject = v },
    get started() { return started },
    handleStart,
    handleReply,
    refreshMessages,
    formatTime,
  }
}
