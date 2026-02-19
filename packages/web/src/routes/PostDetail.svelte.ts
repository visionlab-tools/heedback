import { api } from '../lib/api/client'

export function createPostDetailState(orgId: string, id: string) {
  let post = $state<any>(null)
  let comments = $state<any[]>([])
  let loading = $state(true)
  let newComment = $state('')
  let isInternal = $state(false)
  let newStatus = $state('')

  // orgId comes from URL (router prop) — always correct
  load()

  async function load() {
    try {
      const [postData, commentsData] = await Promise.all([
        api.get<{ data: any }>(`/org/${orgId}/posts/${id}`),
        api.get<{ data: any[] }>(`/org/${orgId}/posts/${id}/comments`),
      ])
      post = postData.data
      comments = commentsData.data
      newStatus = post.status
    } finally {
      loading = false
    }
  }

  async function handleStatusChange() {
    if (!post || newStatus === post.status) return
    await api.put(`/org/${orgId}/posts/${id}`, { status: newStatus })
    post.status = newStatus
  }

  async function handleAddComment(e: Event) {
    e.preventDefault()
    if (!newComment.trim()) return
    const data = await api.post<{ data: any }>(`/org/${orgId}/posts/${id}/comments`, {
      body: newComment,
      isInternal,
    })
    comments = [...comments, data.data]
    newComment = ''
    isInternal = false
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    await api.delete(`/org/${orgId}/posts/${id}`)
    window.history.back()
  }

  return {
    get post() { return post },
    get comments() { return comments },
    get loading() { return loading },
    get newComment() { return newComment },
    set newComment(v: string) { newComment = v },
    get isInternal() { return isInternal },
    set isInternal(v: boolean) { isInternal = v },
    get newStatus() { return newStatus },
    set newStatus(v: string) { newStatus = v },
    handleStatusChange,
    handleAddComment,
    handleDelete,
  }
}
