let apiBase = ''

export function setApiBase(base: string) {
  apiBase = base.replace(/\/$/, '')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export const widgetApi = {
  searchPosts(orgSlug: string, query: string) {
    return request<{ data: any[] }>(`/org/${orgSlug}/posts?q=${encodeURIComponent(query)}&sort=votes`)
  },

  createPost(orgSlug: string, data: { boardId: string; title: string; body: string }) {
    return request<{ data: any }>(`/org/${orgSlug}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  vote(orgSlug: string, postId: string) {
    return request<{ data: any }>(`/org/${orgSlug}/posts/${postId}/vote`, {
      method: 'POST',
    })
  },

  unvote(orgSlug: string, postId: string) {
    return request<void>(`/org/${orgSlug}/posts/${postId}/vote`, {
      method: 'DELETE',
    })
  },

  getBoards(orgSlug: string) {
    return request<{ data: any[] }>(`/org/${orgSlug}/boards`)
  },

  startConversation(
    orgSlug: string,
    data: { subject?: string; body: string; channel?: string; endUserEmail?: string; endUserName?: string }
  ) {
    return request<{ data: any }>(`/org/${orgSlug}/public/conversations`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getConversation(orgSlug: string, conversationId: string) {
    return request<{ data: any }>(`/org/${orgSlug}/public/conversations/${conversationId}`)
  },

  replyToConversation(orgSlug: string, conversationId: string, data: { body: string }) {
    return request<{ data: any }>(`/org/${orgSlug}/public/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Help center
  getCollections(orgSlug: string, locale?: string) {
    const qs = locale ? `?locale=${locale}` : ''
    return request<{ data: any[] }>(`/org/${orgSlug}/public/collections${qs}`)
  },

  getArticle(orgSlug: string, articleId: string, locale?: string) {
    const qs = locale ? `?locale=${locale}` : ''
    return request<{ data: any }>(`/org/${orgSlug}/public/articles/${articleId}${qs}`)
  },

  searchArticles(orgSlug: string, query: string, locale?: string) {
    const localeParam = locale ? `&locale=${locale}` : ''
    return request<{ data: any[] }>(`/org/${orgSlug}/public/articles/search?q=${encodeURIComponent(query)}${localeParam}`)
  },

  sendArticleFeedback(orgSlug: string, articleId: string, data: { rating: number; comment?: string }) {
    return request<{ data: any }>(`/org/${orgSlug}/public/articles/${articleId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
