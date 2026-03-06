import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await apiGet<{ data: any[] }>(`/org/${params.orgSlug}/roadmap`)
    return { roadmap: data.data, locale: params.locale }
  } catch {
    return { roadmap: [], locale: params.locale }
  }
}
