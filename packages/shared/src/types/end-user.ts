export interface EndUser {
  id: string
  organizationId: string
  externalId: string | null
  email: string | null
  name: string | null
  avatarUrl: string | null
  metadata: Record<string, unknown>
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
}

export interface IdentifyEndUserPayload {
  externalId?: string
  email?: string
  name?: string
  avatarUrl?: string
  metadata?: Record<string, unknown>
}
