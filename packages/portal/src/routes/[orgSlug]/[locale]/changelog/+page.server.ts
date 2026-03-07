import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await apiGet<{ data: any[] }>(`/org/${params.orgSlug}/public/changelog?locale=${params.locale}`)
    return { entries: data.data, locale: params.locale }
  } catch {
    return { entries: [], locale: params.locale }
  }
}
