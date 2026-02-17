// --- Conversations ---

export type ConversationStatus = 'open' | 'assigned' | 'resolved' | 'closed'
export type ConversationChannel = 'widget' | 'portal' | 'email'
export type MessageSenderType = 'end_user' | 'admin' | 'system'

export interface Conversation {
  id: string
  organizationId: string
  endUserId: string | null
  subject: string | null
  status: ConversationStatus
  channel: ConversationChannel
  assignedToId: string | null
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
  endUser?: {
    id: string
    name: string | null
    email: string | null
    avatarUrl: string | null
  }
  assignedTo?: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
  lastMessage?: Message
}

export interface Message {
  id: string
  conversationId: string
  senderType: MessageSenderType
  senderId: string | null
  body: string
  isInternal: boolean
  createdAt: string
  updatedAt: string
  sender?: {
    id: string
    name: string | null
    avatarUrl: string | null
    type: MessageSenderType
  }
}

export interface CreateConversationPayload {
  subject?: string
  body: string
  channel?: ConversationChannel
  endUserEmail?: string
  endUserName?: string
}

export interface SendMessagePayload {
  body: string
  isInternal?: boolean
}

export interface UpdateConversationPayload {
  status?: ConversationStatus
  assignedToId?: string | null
}

export interface ConversationFilters {
  status?: ConversationStatus
  assignedToId?: string
  channel?: ConversationChannel
}
