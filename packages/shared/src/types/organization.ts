export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  customDomain: string | null
  settings: OrganizationSettings
  createdAt: string
  updatedAt: string
}

export interface OrganizationSettings {
  portalAuthRequired: boolean
  defaultLocale: string
  brandColor: string
  chatEnabled: boolean
  feedbackEnabled: boolean
  helpCenterEnabled: boolean
}

export type OrgMemberRole = 'owner' | 'admin' | 'agent' | 'viewer'

export interface OrgMember {
  id: string
  organizationId: string
  userId: string
  role: OrgMemberRole
  createdAt: string
  updatedAt: string
  user?: AdminUser
}

export interface CreateOrganizationPayload {
  name: string
  slug: string
  settings?: Partial<OrganizationSettings>
}

export interface UpdateOrganizationPayload {
  name?: string
  slug?: string
  logoUrl?: string | null
  customDomain?: string | null
  settings?: Partial<OrganizationSettings>
}

// Forward reference — defined in admin-user.ts
export interface AdminUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}
