import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any[] }>(`/org/${orgSlug}/articles?collection=${params.collectionSlug}&locale=${params.locale}`)
    return { articles: data.data, collectionSlug: params.collectionSlug, locale: params.locale }
  } catch {
    return { articles: [], collectionSlug: params.collectionSlug, locale: params.locale }
  }
}
