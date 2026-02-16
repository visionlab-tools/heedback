// --- Collections ---

export interface Collection {
  id: string
  organizationId: string
  parentId: string | null
  slug: string
  position: number
  icon: string | null
  createdAt: string
  updatedAt: string
  translations?: CollectionTranslation[]
  children?: Collection[]
  articleCount?: number
}

export interface CollectionTranslation {
  id: string
  collectionId: string
  locale: string
  name: string
  description: string | null
}

export interface CreateCollectionPayload {
  slug: string
  parentId?: string | null
  position?: number
  icon?: string | null
  translations: Array<{
    locale: string
    name: string
    description?: string | null
  }>
}

export interface UpdateCollectionPayload {
  slug?: string
  parentId?: string | null
  position?: number
  icon?: string | null
  translations?: Array<{
    locale: string
    name: string
    description?: string | null
  }>
}

export interface ReorderCollectionsPayload {
  items: Array<{
    id: string
    position: number
  }>
}

// --- Articles ---

export type ArticleStatus = 'draft' | 'published' | 'archived'

export interface Article {
  id: string
  organizationId: string
  collectionId: string | null
  slug: string
  status: ArticleStatus
  position: number
  authorId: string
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  translations?: ArticleTranslation[]
  author?: { id: string; name: string; avatarUrl: string | null }
  collection?: { id: string; slug: string; translations?: CollectionTranslation[] }
}

export interface ArticleTranslation {
  id: string
  articleId: string
  locale: string
  title: string
  body: string
}

export interface CreateArticlePayload {
  collectionId?: string | null
  slug: string
  status?: ArticleStatus
  position?: number
  seoTitle?: string | null
  seoDescription?: string | null
  translations: Array<{
    locale: string
    title: string
    body: string
  }>
}

export interface UpdateArticlePayload {
  collectionId?: string | null
  slug?: string
  status?: ArticleStatus
  position?: number
  seoTitle?: string | null
  seoDescription?: string | null
  publishedAt?: string | null
  translations?: Array<{
    locale: string
    title: string
    body: string
  }>
}

// --- Article Feedback ---

export interface ArticleFeedback {
  id: string
  articleId: string
  helpful: boolean
  comment: string | null
  endUserId: string | null
  ipAddress: string | null
  createdAt: string
}

export interface CreateArticleFeedbackPayload {
  helpful: boolean
  comment?: string | null
}

// --- Search ---

export interface SearchResult {
  type: 'article' | 'collection'
  id: string
  title: string
  excerpt: string
  url: string
  locale: string
}
