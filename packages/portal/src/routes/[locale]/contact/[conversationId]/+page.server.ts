import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any }>(
      `/org/${orgSlug}/public/conversations/${params.conversationId}`
    )
    return { conversation: data.data, locale: params.locale }
  } catch {
    return { conversation: null, locale: params.locale }
  }
}
