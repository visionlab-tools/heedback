import { apiGet } from '$lib/api/portal-client'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const data = await apiGet<{ data: any }>(`/org/${orgSlug}/articles/${params.articleSlug}`)
    return {
      article: data.data,
      collectionSlug: params.collectionSlug,
    }
  } catch {
    throw error(404, 'Article not found')
  }
}
