import { json } from '@sveltejs/kit'
import { apiPost } from '$lib/api/portal-client'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json()
  const orgSlug = 'default'

  try {
    const data = await apiPost<{ data: any }>(`/org/${orgSlug}/public/conversations`, body)
    return json(data)
  } catch {
    return json({ error: 'Failed to send message' }, { status: 500 })
  }
}
