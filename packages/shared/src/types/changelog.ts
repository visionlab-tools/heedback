export type ChangelogStatus = 'draft' | 'scheduled' | 'published'
export type ChangelogLabel = 'new' | 'improvement' | 'fix' | 'breaking'

export interface ChangelogEntry {
  id: string
  organizationId: string
  slug: string
  authorId: string
  status: ChangelogStatus
  labels: ChangelogLabel[]
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
  translations?: ChangelogEntryTranslation[]
  linkedPosts?: Array<{
    id: string
    title: string
    voteCount: number
  }>
  author?: { id: string; name: string; avatarUrl: string | null }
}

export interface ChangelogEntryTranslation {
  id: string
  changelogEntryId: string
  locale: string
  title: string
  body: string
}

export interface CreateChangelogEntryPayload {
  slug: string
  status?: ChangelogStatus
  labels?: ChangelogLabel[]
  scheduledAt?: string | null
  postIds?: string[]
  translations: Array<{
    locale: string
    title: string
    body: string
  }>
}

export interface UpdateChangelogEntryPayload {
  slug?: string
  status?: ChangelogStatus
  labels?: ChangelogLabel[]
  scheduledAt?: string | null
  publishedAt?: string | null
  postIds?: string[]
  translations?: Array<{
    locale: string
    title: string
    body: string
  }>
}

export interface ChangelogSubscriber {
  id: string
  organizationId: string
  email: string
  endUserId: string | null
  subscribedAt: string
  unsubscribedAt: string | null
}

export interface SubscribePayload {
  email: string
}
