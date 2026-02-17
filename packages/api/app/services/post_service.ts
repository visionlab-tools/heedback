import { v4 as uuid } from 'uuid'
import Post from '#models/post'
import Vote from '#models/vote'

interface PostFilters {
  boardId?: string
  status?: string
  tagId?: string
  page?: number
  limit?: number
  sortBy?: string
}

export default class PostService {
  /**
   * List non-merged posts with filters and pagination.
   */
  async list(orgId: string, filters: PostFilters) {
    const query = Post.query()
      .where('organization_id', orgId)
      .whereNull('merged_into_id')
      .preload('tags')
      .preload('endUser')
      .preload('board')

    if (filters.boardId) {
      query.where('board_id', filters.boardId)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.tagId) {
      query.whereHas('tags', (tagQuery) => {
        tagQuery.where('tags.id', filters.tagId!)
      })
    }

    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)
    const sortBy = filters.sortBy === 'recent' ? 'created_at' : 'vote_count'

    return query.orderBy(sortBy, 'desc').paginate(page, limit)
  }

  /**
   * Create a new post with optional tags.
   */
  async create(
    orgId: string,
    adminUserId: string,
    data: {
      boardId: string
      title: string
      body?: string | null
      status?: 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'closed'
      eta?: string | null
      tagIds?: string[]
    },
  ): Promise<Post> {
    const post = await Post.create({
      id: uuid(),
      organizationId: orgId,
      boardId: data.boardId,
      adminUserId,
      title: data.title,
      body: data.body ?? null,
      status: data.status ?? 'open',
      voteCount: 0,
      commentCount: 0,
      eta: data.eta ?? null,
    })

    if (data.tagIds && data.tagIds.length > 0) {
      await post.related('tags').attach(data.tagIds)
    }

    await post.load('tags')
    await post.load('board')

    return post
  }

  /**
   * Show a single post with all relations.
   * Returns null if not found.
   */
  async show(orgId: string, postId: string): Promise<Post | null> {
    return Post.query()
      .where('id', postId)
      .where('organization_id', orgId)
      .preload('tags')
      .preload('board')
      .preload('endUser')
      .preload('adminUser')
      .preload('mergedPosts')
      .preload('votes')
      .first()
  }

  /**
   * Update a post and sync tags.
   * Returns null if the post is not found.
   */
  async update(
    orgId: string,
    postId: string,
    data: {
      boardId?: string
      title?: string
      body?: string | null
      status?: 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'closed'
      eta?: string | null
      tagIds?: string[]
    },
  ): Promise<Post | null> {
    const post = await Post.query()
      .where('id', postId)
      .where('organization_id', orgId)
      .first()

    if (!post) {
      return null
    }

    post.merge({
      boardId: data.boardId ?? post.boardId,
      title: data.title ?? post.title,
      body: data.body !== undefined ? data.body : post.body,
      status: data.status ?? post.status,
      eta: data.eta !== undefined ? data.eta : post.eta,
    })

    await post.save()

    if (data.tagIds !== undefined) {
      await post.related('tags').sync(data.tagIds)
    }

    await post.load('tags')
    await post.load('board')

    return post
  }

  /**
   * Delete a post.
   * Returns null if the post is not found.
   */
  async delete(orgId: string, postId: string): Promise<Post | null> {
    const post = await Post.query()
      .where('id', postId)
      .where('organization_id', orgId)
      .first()

    if (!post) {
      return null
    }

    await post.delete()

    return post
  }

  /**
   * Add a vote from an admin user to a post.
   * Returns null if the post is not found.
   * Throws if the user has already voted on this post.
   */
  async vote(
    postId: string,
    orgId: string,
    adminUserId: string,
  ): Promise<{ post: Post; voteCount: number } | null> {
    const post = await Post.query()
      .where('id', postId)
      .where('organization_id', orgId)
      .first()

    if (!post) {
      return null
    }

    const existingVote = await Vote.query()
      .where('post_id', post.id)
      .where('admin_user_id', adminUserId)
      .first()

    if (existingVote) {
      throw new Error('You have already voted on this post')
    }

    await Vote.create({
      id: uuid(),
      postId: post.id,
      adminUserId,
    })

    post.voteCount = post.voteCount + 1
    await post.save()

    return { post, voteCount: post.voteCount }
  }

  /**
   * Remove a vote from an admin user on a post.
   * Returns null if the post or vote is not found.
   */
  async unvote(
    postId: string,
    orgId: string,
    adminUserId: string,
  ): Promise<{ post: Post; voteCount: number } | null> {
    const post = await Post.query()
      .where('id', postId)
      .where('organization_id', orgId)
      .first()

    if (!post) {
      return null
    }

    const vote = await Vote.query()
      .where('post_id', post.id)
      .where('admin_user_id', adminUserId)
      .first()

    if (!vote) {
      return null
    }

    await vote.delete()

    post.voteCount = Math.max(0, post.voteCount - 1)
    await post.save()

    return { post, voteCount: post.voteCount }
  }

  /**
   * Merge a source post into a target post.
   * Returns null if either post is not found.
   * Throws if attempting to merge a post into itself.
   */
  async merge(
    orgId: string,
    sourcePostId: string,
    targetPostId: string,
  ): Promise<{ sourcePost: Post; targetPost: Post } | null> {
    const sourcePost = await Post.query()
      .where('id', sourcePostId)
      .where('organization_id', orgId)
      .first()

    if (!sourcePost) {
      return null
    }

    const targetPost = await Post.query()
      .where('id', targetPostId)
      .where('organization_id', orgId)
      .first()

    if (!targetPost) {
      return null
    }

    if (sourcePost.id === targetPost.id) {
      throw new Error('Cannot merge a post into itself')
    }

    sourcePost.mergedIntoId = targetPost.id
    sourcePost.status = 'closed'
    await sourcePost.save()

    targetPost.voteCount = targetPost.voteCount + sourcePost.voteCount
    await targetPost.save()

    return { sourcePost, targetPost }
  }
}
