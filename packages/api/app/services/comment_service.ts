import { v4 as uuid } from 'uuid'
import Post from '#models/post'
import Comment from '#models/comment'

export default class CommentService {
  async list(orgId: string, postId: string) {
    const post = await Post.query().where('id', postId).where('organization_id', orgId).first()
    if (!post) return null
    const comments = await Comment.query()
      .where('post_id', post.id)
      .whereNull('parent_id')
      .preload('endUser')
      .preload('adminUser')
      .preload('replies', (query) => {
        query.preload('endUser').preload('adminUser').orderBy('created_at', 'asc')
      })
      .orderBy('created_at', 'asc')
    return comments
  }

  async create(
    orgId: string,
    postId: string,
    adminUserId: string,
    data: { body: string; parentId?: string | null; isInternal?: boolean },
  ) {
    const post = await Post.query().where('id', postId).where('organization_id', orgId).first()
    if (!post) return null
    if (data.parentId) {
      const parent = await Comment.query()
        .where('id', data.parentId)
        .where('post_id', post.id)
        .first()
      if (!parent) throw new Error('Parent comment not found')
    }
    const comment = await Comment.create({
      id: uuid(),
      postId: post.id,
      parentId: data.parentId ?? null,
      adminUserId,
      body: data.body,
      isInternal: data.isInternal ?? false,
    })
    post.commentCount = post.commentCount + 1
    await post.save()
    await comment.load('adminUser')
    return comment
  }

  async update(orgId: string, commentId: string, data: { body: string }) {
    const comment = await Comment.query()
      .where('id', commentId)
      .whereHas('post', (q) => {
        q.where('organization_id', orgId)
      })
      .first()
    if (!comment) return null
    comment.body = data.body
    await comment.save()
    await comment.load('adminUser')
    await comment.load('endUser')
    return comment
  }

  async delete(orgId: string, commentId: string) {
    const comment = await Comment.query()
      .where('id', commentId)
      .whereHas('post', (q) => {
        q.where('organization_id', orgId)
      })
      .first()
    if (!comment) return null
    const post = await Post.find(comment.postId)
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1)
      await post.save()
    }
    await comment.delete()
    return true
  }
}
