import { json } from '@sveltejs/kit'
import { apiPost } from '$lib/api/portal-client'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, params }) => {
  const body = await request.json()

  try {
    const data = await apiPost<{ data: any }>(`/org/${params.orgSlug}/public/conversations`, body)
    return json(data)
  } catch {
    return json({ error: 'Failed to send message' }, { status: 500 })
  }
}
