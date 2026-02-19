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
  getOrgConfig(orgId: string) {
    return request<{ data: { name: string; brandColor: string; widgetColor: string } }>(
      `/org/${orgId}/public/config`
    )
  },

  searchPosts(orgId: string, query: string) {
    return request<{ data: any[] }>(`/org/${orgId}/posts?q=${encodeURIComponent(query)}&sort=votes`)
  },

  createPost(orgId: string, data: { boardId: string; title: string; body: string }) {
    return request<{ data: any }>(`/org/${orgId}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  vote(orgId: string, postId: string) {
    return request<{ data: any }>(`/org/${orgId}/posts/${postId}/vote`, {
      method: 'POST',
    })
  },

  unvote(orgId: string, postId: string) {
    return request<void>(`/org/${orgId}/posts/${postId}/vote`, {
      method: 'DELETE',
    })
  },

  getBoards(orgId: string) {
    return request<{ data: any[] }>(`/org/${orgId}/boards`)
  },

  startConversation(
    orgId: string,
    data: {
      body: string
      channel?: string
      endUserId?: string
      endUserExternalId?: string
      endUserFirstName?: string
      endUserLastName?: string
      endUserEmail?: string
      endUserAvatarUrl?: string
    }
  ) {
    return request<{ data: any }>(`/org/${orgId}/public/conversations`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getConversation(orgId: string, conversationId: string) {
    return request<{ data: any }>(`/org/${orgId}/public/conversations/${conversationId}`)
  },

  replyToConversation(orgId: string, conversationId: string, data: { body: string }) {
    return request<{ data: any }>(`/org/${orgId}/public/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  listConversations(orgId: string, endUserId: string) {
    return request<{ data: any[] }>(
      `/org/${orgId}/public/end-users/${endUserId}/conversations`
    )
  },

  // Help center
  getCollections(orgId: string, locale?: string) {
    const qs = locale ? `?locale=${locale}` : ''
    return request<{ data: any[] }>(`/org/${orgId}/public/collections${qs}`)
  },

  getArticle(orgId: string, articleId: string, locale?: string) {
    const qs = locale ? `?locale=${locale}` : ''
    return request<{ data: any }>(`/org/${orgId}/public/articles/${articleId}${qs}`)
  },

  searchArticles(orgId: string, query: string, locale?: string) {
    const localeParam = locale ? `&locale=${locale}` : ''
    return request<{ data: any[] }>(`/org/${orgId}/public/articles/search?q=${encodeURIComponent(query)}${localeParam}`)
  },

  sendArticleFeedback(orgId: string, articleId: string, data: { rating: number; comment?: string }) {
    return request<{ data: any }>(`/org/${orgId}/public/articles/${articleId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

/** Connect to a conversation's SSE stream. Returns a function to disconnect. */
export function connectSSE(
  orgId: string,
  conversationId: string,
  onMessage: (event: { event: string; data: any }) => void,
): () => void {
  const url = `${apiBase}/api/v1/org/${orgId}/public/conversations/${conversationId}/sse`
  const es = new EventSource(url)

  es.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data))
    } catch {
      // Ignore malformed SSE data
    }
  }

  return () => es.close()
}
