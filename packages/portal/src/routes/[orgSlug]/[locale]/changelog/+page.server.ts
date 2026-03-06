import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any[] }>(`/org/${orgSlug}/changelog?locale=${params.locale}`)
    return { entries: data.data, locale: params.locale }
  } catch {
    return { entries: [], locale: params.locale }
  }
}
