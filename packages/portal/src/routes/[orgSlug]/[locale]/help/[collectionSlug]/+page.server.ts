import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await apiGet<{ data: any[] }>(`/org/${params.orgSlug}/articles?collection=${params.collectionSlug}&locale=${params.locale}`)
    return { articles: data.data, collectionSlug: params.collectionSlug, locale: params.locale }
  } catch {
    return { articles: [], collectionSlug: params.collectionSlug, locale: params.locale }
  }
}
