import { env } from '$env/dynamic/private'

const API_URL = env.API_URL || 'http://localhost:3333'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
