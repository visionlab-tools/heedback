import { api } from '../lib/api/client'
import { currentOrg } from '../lib/stores/org'

interface Conversation {
  id: string
  subject: string | null
  status: string
  channel: string
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
  endUser?: { name: string | null; email: string | null }
  assignedTo?: { fullName: string }
}

export function createInboxState() {
  let conversations = $state<Conversation[]>([])
  let loading = $state(true)
  let orgSlug = $state('')
  let statusFilter = $state('')

  currentOrg.subscribe((org) => {
    if (org) orgSlug = org.slug
  })

  async function loadConversations() {
    if (!orgSlug) return
    loading = true
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const data = await api.get<{ data: Conversation[] }>(`/org/${orgSlug}/conversations?${params}`)
      conversations = data.data
    } catch {
      // Handle error
    } finally {
      loading = false
    }
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

  function channelLabel(channel: string): string {
    const map: Record<string, string> = {
      widget: 'Widget',
      portal: 'Portal',
      email: 'Email',
    }
    return map[channel] || channel
  }

  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return {
    get conversations() { return conversations },
    get loading() { return loading },
    get statusFilter() { return statusFilter },
    set statusFilter(v: string) { statusFilter = v },
    loadConversations,
    statusBadgeClass,
    channelLabel,
    timeAgo,
  }
}
