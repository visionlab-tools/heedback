import { apiGet } from '$lib/api/portal-client'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any }>(`/org/${orgSlug}/changelog/${params.slug}?locale=${params.locale}`)
    return { entry: data.data, locale: params.locale }
  } catch {
    throw error(404, 'Changelog entry not found')
  }
}
