export interface EndUser {
  id: string
  organizationId: string
  externalId: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  displayName: string | null
  avatarUrl: string | null
  position: string | null
  company: string | null
  pricingPlan: string | null
  language: string | null
  metadata: Record<string, string | number>
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
}

export interface IdentifyEndUserPayload {
  externalId?: string
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  position?: string
  company?: string
  pricingPlan?: string
  language?: string
  metadata?: Record<string, string | number>
}
