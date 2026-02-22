import { api } from '../lib/api/client'
import { navigate } from '../lib/router.svelte.ts'

interface Conversation {
  id: string
  subject: string | null
  status: string
  channel: string
  assignedToId: string | null
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
  endUser?: { name: string | null; email: string | null; avatarUrl: string | null }
  assignedTo?: { id: string; fullName: string; avatarUrl: string | null }
  messages?: Message[]
}

interface OrgMember {
  id: string
  role: string
  user: { id: string; fullName: string; email: string; avatarUrl: string | null }
}

interface MessageAttachment {
  key: string
  name: string
  type: string
  size: number
  url?: string
}

interface Message {
  id: string
  body: string
  senderType: string
  isInternal: boolean
  createdAt: string
  attachments?: MessageAttachment[]
  pageUrl?: string | null
}

type BadgeVariant = 'info' | 'warning' | 'success' | 'neutral'

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  open: 'info',
  assigned: 'warning',
  resolved: 'success',
}

const CHANNEL_LABELS: Record<string, string> = {
  widget: 'Widget',
  portal: 'Portal',
  email: 'Email',
}

export function createInboxState(orgId: string) {
  let conversations = $state<Conversation[]>([])
  let loading = $state(true)
  let statusFilter = $state('')

  // Detail state
  let selectedId = $state<string | undefined>(undefined)
  let conversation = $state<Conversation | null>(null)
  let messages = $state<Message[]>([])
  let detailLoading = $state(false)
  let newMessage = $state('')
  let isInternal = $state(false)
  let newStatus = $state('')
  let sending = $state(false)

  // Members for assignment dropdown
  let members = $state<OrgMember[]>([])
  let assigneeId = $state('')

  // SSE — plain variable, not reactive (never read in templates)
  let eventSource: EventSource | null = null

  // Load immediately — orgId comes from the URL, always available
  loadConversations()
  loadMembers()
  connectInboxSse()

  async function loadMembers() {
    try {
      const data = await api.get<{ data: OrgMember[] }>(`/org/${orgId}/members`)
      members = data.data
    } catch {
      members = []
    }
  }

  async function loadConversations() {
    if (!orgId) return
    loading = true
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const data = await api.get<{ data: Conversation[] }>(`/org/${orgId}/conversations?${params}`)
      conversations = data.data
    } finally {
      loading = false
    }
  }

  async function loadConversation() {
    if (!orgId || !selectedId) return
    detailLoading = true
    try {
      const data = await api.get<{ data: Conversation }>(`/org/${orgId}/conversations/${selectedId}`)
      conversation = data.data
      messages = data.data.messages || []
      newStatus = data.data.status
      assigneeId = data.data.assignedToId ?? ''
    } finally {
      detailLoading = false
    }
  }

  function selectConversation(id: string) {
    selectedId = id
    navigate(`/${orgId}/inbox/${id}`)
    loadConversation()
  }

  function clearSelection() {
    selectedId = undefined
    conversation = null
    messages = []
    navigate(`/${orgId}/inbox`)
  }

  async function handleStatusChange() {
    if (!conversation || !selectedId || newStatus === conversation.status) return
    await api.put(`/org/${orgId}/conversations/${selectedId}`, { status: newStatus })
    conversation.status = newStatus
  }

  async function handleAssign() {
    if (!conversation || !selectedId) return
    const id = assigneeId || null
    await api.put(`/org/${orgId}/conversations/${selectedId}`, { assignedToId: id })
    conversation.assignedToId = id
    if (id) {
      conversation.assignedTo = members.find((m) => m.user.id === id)?.user as any
    } else {
      conversation.assignedTo = undefined
    }
  }

  async function handleSend(e: Event) {
    e.preventDefault()
    if (!newMessage.trim() || sending || !selectedId) return
    sending = true
    try {
      const data = await api.post<{ data: Message }>(
        `/org/${orgId}/conversations/${selectedId}/messages`,
        { body: newMessage, isInternal },
      )
      // SSE may deliver the same message — deduplicate
      if (!messages.some((m) => m.id === data.data.id)) {
        messages = [...messages, data.data]
      }
      newMessage = ''
      isInternal = false
    } finally {
      sending = false
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this conversation?')) return
    await api.delete(`/org/${orgId}/conversations/${selectedId}`)
    clearSelection()
    loadConversations()
  }

  function connectInboxSse() {
    disconnectInboxSse()
    if (!orgId) return

    const url = `/api/v1/org/${orgId}/sse/inbox`
    const es = new EventSource(url, { withCredentials: true })

    es.onmessage = (e) => {
      try {
        handleSseEvent(JSON.parse(e.data))
      } catch {
        // Ignore malformed SSE data
      }
    }

    eventSource = es
  }

  function handleSseEvent(event: { event: string; data: any }) {
    if (event.event === 'conversation.created') {
      // Prepend new conversation to the list
      conversations = [event.data, ...conversations]
    }

    if (event.event === 'message.created') {
      // Bump conversation to top and update preview
      const convId = event.data.conversationId
      const idx = conversations.findIndex((c) => c.id === convId)
      if (idx >= 0) {
        const updated = { ...conversations[idx], lastMessageAt: event.data.createdAt, messageCount: conversations[idx].messageCount + 1 }
        conversations = [updated, ...conversations.slice(0, idx), ...conversations.slice(idx + 1)]
      }

      // If viewing this conversation, append message (deduplicate)
      if (selectedId === convId && !messages.some((m) => m.id === event.data.id)) {
        messages = [...messages, event.data]
      }
    }

    if (event.event === 'conversation.updated') {
      const idx = conversations.findIndex((c) => c.id === event.data.id)
      if (idx >= 0) {
        conversations[idx] = { ...conversations[idx], ...event.data }
        conversations = [...conversations]
      }
      // Update detail view if the updated conversation is selected
      if (selectedId === event.data.id && conversation) {
        conversation = { ...conversation, ...event.data }
        newStatus = event.data.status ?? newStatus
      }
    }
  }

  function disconnectInboxSse() {
    eventSource?.close()
    eventSource = null
  }

  function cleanup() {
    disconnectInboxSse()
  }

  /** Initialize from URL param on mount */
  function init(id: string | undefined) {
    selectedId = id
    if (id) loadConversation()
  }

  return {
    get conversations() { return conversations },
    get loading() { return loading },
    get statusFilter() { return statusFilter },
    set statusFilter(v: string) { statusFilter = v },
    get selectedId() { return selectedId },
    get conversation() { return conversation },
    get messages() { return messages },
    get detailLoading() { return detailLoading },
    get newMessage() { return newMessage },
    set newMessage(v: string) { newMessage = v },
    get isInternal() { return isInternal },
    set isInternal(v: boolean) { isInternal = v },
    get newStatus() { return newStatus },
    set newStatus(v: string) { newStatus = v },
    get sending() { return sending },
    get members() { return members },
    get assigneeId() { return assigneeId },
    set assigneeId(v: string) { assigneeId = v },
    init,
    loadConversations,
    selectConversation,
    clearSelection,
    handleStatusChange,
    handleAssign,
    handleSend,
    handleDelete,
    cleanup,
    statusVariant: (status: string): BadgeVariant => STATUS_VARIANTS[status] || 'neutral',
    channelLabel: (channel: string): string => CHANNEL_LABELS[channel] || channel,
    timeAgo,
    formatTime: (dateStr: string): string => new Date(dateStr).toLocaleString(),
  }
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
