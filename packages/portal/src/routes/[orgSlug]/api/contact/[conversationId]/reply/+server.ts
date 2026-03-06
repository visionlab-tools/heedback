import { json } from '@sveltejs/kit'
import { apiPost } from '$lib/api/portal-client'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, request }) => {
  const body = await request.json()

  try {
    const data = await apiPost<{ data: any }>(
      `/org/${params.orgSlug}/public/conversations/${params.conversationId}/messages`,
      body
    )
    return json(data)
  } catch {
    return json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
