import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setApiBase, widgetApi } from './widget-client'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }
}

describe('widget-client', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    setApiBase('https://api.example.com')
  })

  describe('setApiBase', () => {
    it('strips trailing slash', () => {
      setApiBase('https://api.example.com/')
      mockFetch.mockResolvedValue(mockResponse({ data: [] }))
      widgetApi.getBoards('test-org')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/test-org/boards',
        expect.any(Object),
      )
    })
  })

  describe('searchPosts', () => {
    it('calls correct URL with encoded query', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: [] }))
      await widgetApi.searchPosts('my-org', 'hello world')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/my-org/posts?q=hello%20world&sort=votes',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
    })
  })

  describe('createPost', () => {
    it('sends POST request with body', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: { id: '123' } }))
      await widgetApi.createPost('my-org', {
        boardId: 'board-1',
        title: 'Test',
        body: 'Description',
      })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/my-org/posts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            boardId: 'board-1',
            title: 'Test',
            body: 'Description',
          }),
        }),
      )
    })
  })

  describe('vote', () => {
    it('sends POST to vote endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: { voteCount: 1 } }))
      await widgetApi.vote('my-org', 'post-1')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/my-org/posts/post-1/vote',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('unvote', () => {
    it('sends DELETE to vote endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(undefined))
      await widgetApi.unvote('my-org', 'post-1')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/my-org/posts/post-1/vote',
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })

  describe('startConversation', () => {
    it('sends POST with conversation data', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: { id: 'conv-1' } }))
      await widgetApi.startConversation('my-org', {
        body: 'Hello',
        channel: 'widget',
        endUserEmail: 'user@test.com',
      })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/my-org/public/conversations',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            body: 'Hello',
            channel: 'widget',
            endUserEmail: 'user@test.com',
          }),
        }),
      )
    })
  })

  describe('searchArticles', () => {
    it('calls correct endpoint with encoded query', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: [] }))
      await widgetApi.searchArticles('my-org', 'search term')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/org/my-org/public/articles/search?q=search%20term',
        expect.any(Object),
      )
    })
  })

  describe('error handling', () => {
    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValue(mockResponse({ error: 'Not found' }, false, 404))
      await expect(widgetApi.getBoards('my-org')).rejects.toThrow('API error: 404')
    })
  })
})
