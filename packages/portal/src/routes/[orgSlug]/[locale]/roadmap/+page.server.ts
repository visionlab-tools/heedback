import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any[] }>(`/org/${orgSlug}/roadmap`)
    return { roadmap: data.data, locale: params.locale }
  } catch {
    return { roadmap: [], locale: params.locale }
  }
}
