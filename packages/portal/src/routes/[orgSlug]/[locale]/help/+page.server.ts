import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await apiGet<{ data: any[] }>(`/org/${params.orgSlug}/public/collections?locale=${params.locale}`)
    return { collections: data.data, locale: params.locale }
  } catch {
    return { collections: [], locale: params.locale }
  }
}
