import { error } from '@sveltejs/kit'
import { apiGet } from '$lib/api/portal-client'
import type { LayoutServerLoad } from './$types'

/** Validates the org slug exists — returns 404 for unknown organizations */
export const load: LayoutServerLoad = async ({ params }) => {
  try {
    const result = await apiGet<{ data: { name: string; brandColor: string } }>(
      `/org/${params.orgSlug}/public/config`
    )
    return { org: { slug: params.orgSlug, ...result.data } }
  } catch {
    throw error(404, 'Organization not found')
  }
}
