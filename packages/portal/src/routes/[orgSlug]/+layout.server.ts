import { error } from '@sveltejs/kit'
import { apiGet } from '$lib/api/portal-client'
import type { LayoutServerLoad } from './$types'

/** Validates the org slug exists — returns 404 for unknown organizations */
export const load: LayoutServerLoad = async ({ params }) => {
  try {
    const org = await apiGet<{ data: { slug: string; name: string } }>(
      `/org/${params.orgSlug}/public/info`
    )
    return { org: org.data }
  } catch {
    throw error(404, 'Organization not found')
  }
}
