import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  // TODO: resolve org from host/subdomain
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any[] }>(`/org/${orgSlug}/collections`)
    return { collections: data.data }
  } catch {
    return { collections: [] }
  }
}
