const API_BASE = '/api/v1'

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

class ApiError extends Error {
  constructor(
    public status: number,
    public errors: Array<{ message: string; field?: string }>,
  ) {
    super(errors[0]?.message || `API Error ${status}`)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    credentials: 'include',
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${path}`, config)

  if (!response.ok) {
    const data = await response.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    throw new ApiError(response.status, data.errors || [{ message: data.message || 'Unknown error' }])
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export { ApiError }
