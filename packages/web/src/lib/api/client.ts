import { _ } from 'svelte-i18n'
import { get } from 'svelte/store'
import { addToast } from '../stores/toast'

const API_BASE = '/api/v1'

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  silent?: boolean
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

function errorMessageForStatus(status: number): string {
  const t = get(_)
  const keyMap: Record<number, string> = {
    400: 'error.bad_request',
    401: 'error.unauthorized',
    403: 'error.forbidden',
    404: 'error.not_found',
  }
  return t(keyMap[status] || 'error.server')
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, silent = false } = options

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

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, config)
  } catch {
    if (!silent) addToast(get(_)('error.network'), 'error')
    throw new Error('Network error')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const apiError = new ApiError(response.status, data.errors || [{ message: data.message || 'Unknown error' }])

    if (!silent) {
      // 422 = validation error — use backend message as-is
      const message = response.status === 422 ? apiError.message : errorMessageForStatus(response.status)
      addToast(message, 'error')
    }

    throw apiError
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

async function uploadFile(file: File): Promise<{ key: string }> {
  const form = new FormData()
  form.append('file', file)

  let response: Response
  try {
    // No Content-Type header — the browser sets the multipart boundary
    response = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
  } catch {
    addToast(get(_)('error.network'), 'error')
    throw new Error('Network error')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ errors: [{ message: 'Upload failed' }] }))
    const apiError = new ApiError(response.status, data.errors || [{ message: 'Upload failed' }])
    addToast(apiError.message, 'error')
    throw apiError
  }

  return response.json()
}

export const api = {
  get: <T>(path: string, opts?: { silent?: boolean }) =>
    request<T>(path, { ...opts }),
  post: <T>(path: string, body?: unknown, opts?: { silent?: boolean }) =>
    request<T>(path, { method: 'POST', body, ...opts }),
  put: <T>(path: string, body?: unknown, opts?: { silent?: boolean }) =>
    request<T>(path, { method: 'PUT', body, ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: { silent?: boolean }) =>
    request<T>(path, { method: 'PATCH', body, ...opts }),
  delete: <T>(path: string, opts?: { silent?: boolean }) =>
    request<T>(path, { method: 'DELETE', ...opts }),
  upload: uploadFile,
}

export { ApiError }
