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
    await api.patch(`/org/${orgSlug}/conversations/${id}`, { status: newStatus })
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

  function statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return map[status] || 'bg-gray-100 text-gray-800'
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
    statusBadgeClass,
    formatTime,
  }
}
