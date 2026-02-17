import { api } from '../lib/api/client'
import { currentOrg } from '../lib/stores/org'

export function createConversationDetailState(id: string) {
  let orgSlug = $state('')
  let conversation = $state<any>(null)
  let messages = $state<any[]>([])
  let loading = $state(true)
  let newMessage = $state('')
  let isInternal = $state(false)
  let newStatus = $state('')
  let sending = $state(false)

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  async function loadConversation() {
    if (!orgSlug || !id) return
    try {
      const data = await api.get<{ data: any }>(`/org/${orgSlug}/conversations/${id}`)
      conversation = data.data
      messages = data.data.messages || []
      newStatus = conversation.status
    } catch {
      // Handle error
    } finally {
      loading = false
    }
  }

  async function handleStatusChange() {
    if (!conversation || newStatus === conversation.status) return
    await api.put(`/org/${orgSlug}/conversations/${id}`, { status: newStatus })
    conversation.status = newStatus
  }

  async function handleSend(e: Event) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    sending = true
    try {
      const data = await api.post<{ data: any }>(`/org/${orgSlug}/conversations/${id}/messages`, {
        body: newMessage,
        isInternal,
      })
      messages = [...messages, data.data]
      newMessage = ''
      isInternal = false
    } finally {
      sending = false
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this conversation?')) return
    await api.delete(`/org/${orgSlug}/conversations/${id}`)
    window.history.back()
  }

  type BadgeVariant = 'info' | 'warning' | 'success' | 'neutral'

  function statusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      open: 'info',
      assigned: 'warning',
      resolved: 'success',
    }
    return map[status] || 'neutral'
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString()
  }

  return {
    get conversation() { return conversation },
    get messages() { return messages },
    get loading() { return loading },
    get newMessage() { return newMessage },
    set newMessage(v: string) { newMessage = v },
    get isInternal() { return isInternal },
    set isInternal(v: boolean) { isInternal = v },
    get newStatus() { return newStatus },
    set newStatus(v: string) { newStatus = v },
    get sending() { return sending },
    loadConversation,
    handleStatusChange,
    handleSend,
    handleDelete,
    statusVariant,
    formatTime,
  }
}
