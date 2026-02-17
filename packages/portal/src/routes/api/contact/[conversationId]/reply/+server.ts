import { json } from '@sveltejs/kit'
import { apiPost } from '$lib/api/portal-client'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, request }) => {
  const body = await request.json()
  const orgSlug = 'default'

  try {
    const data = await apiPost<{ data: any }>(
      `/org/${orgSlug}/public/conversations/${params.conversationId}/messages`,
      body
    )
    return json(data)
  } catch {
    return json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
