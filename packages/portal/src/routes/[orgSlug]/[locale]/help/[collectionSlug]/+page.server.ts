import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

const PAGE_SIZE = 20

export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await apiGet<{ data: any[]; meta: any }>(
      `/org/${params.orgSlug}/public/articles?collection=${params.collectionSlug}&locale=${params.locale}&page=1&limit=${PAGE_SIZE}`,
    )
    return {
      articles: data.data,
      meta: data.meta,
      collectionSlug: params.collectionSlug,
      locale: params.locale,
    }
  } catch {
    return {
      articles: [],
      meta: null,
      collectionSlug: params.collectionSlug,
      locale: params.locale,
    }
  }
}
