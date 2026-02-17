import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  // TODO: resolve org from host/subdomain
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any[] }>(`/org/${orgSlug}/collections?locale=${params.locale}`)
    return { collections: data.data, locale: params.locale }
  } catch {
    return { collections: [], locale: params.locale }
  }
}
