// --- Boards ---

export interface Board {
  id: string
  organizationId: string
  name: string
  slug: string
  description: string | null
  position: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  postCount?: number
}

export interface CreateBoardPayload {
  name: string
  slug: string
  description?: string | null
  position?: number
  isPublic?: boolean
}

export interface UpdateBoardPayload {
  name?: string
  slug?: string
  description?: string | null
  position?: number
  isPublic?: boolean
}

// --- Posts ---

export type PostStatus = 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'closed'
export type AuthorType = 'end_user' | 'admin'

export interface Post {
  id: string
  organizationId: string
  boardId: string
  authorType: AuthorType
  authorId: string
  title: string
  body: string
  status: PostStatus
  voteCount: number
  mergedIntoId: string | null
  pinned: boolean
  createdAt: string
  updatedAt: string
  board?: Board
  tags?: Tag[]
  author?: {
    id: string
    name: string | null
    avatarUrl: string | null
    type: AuthorType
  }
  hasVoted?: boolean
}

export interface CreatePostPayload {
  boardId: string
  title: string
  body: string
  tagIds?: string[]
}

export interface UpdatePostPayload {
  boardId?: string
  title?: string
  body?: string
  status?: PostStatus
  pinned?: boolean
  tagIds?: string[]
}

export interface MergePostPayload {
  targetPostId: string
}

export type PostSortField = 'votes' | 'newest' | 'oldest'

export interface PostFilters {
  boardId?: string
  status?: PostStatus
  tagId?: string
  sort?: PostSortField
}

// --- Votes ---

export interface Vote {
  id: string
  postId: string
  endUserId: string | null
  ipAddress: string | null
  createdAt: string
}

// --- Comments ---

export interface Comment {
  id: string
  postId: string
  authorType: AuthorType
  authorId: string
  body: string
  isInternal: boolean
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string | null
    avatarUrl: string | null
    type: AuthorType
  }
}

export interface CreateCommentPayload {
  body: string
  isInternal?: boolean
}

export interface UpdateCommentPayload {
  body: string
}

// --- Tags ---

export interface Tag {
  id: string
  organizationId: string
  name: string
  color: string
}

export interface CreateTagPayload {
  name: string
  color: string
}

// --- Roadmap ---

export interface RoadmapColumn {
  status: PostStatus
  label: string
  posts: Post[]
}

export type Roadmap = RoadmapColumn[]
