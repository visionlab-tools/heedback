import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url, params }) => {
  const orgSlug = 'default'
  const status = url.searchParams.get('status') || ''
  const sort = url.searchParams.get('sort') || 'votes'
  const board = url.searchParams.get('board') || ''

  try {
    const searchParams = new URLSearchParams()
    if (status) searchParams.set('status', status)
    if (sort) searchParams.set('sort', sort)
    if (board) searchParams.set('board', board)

    const [postsData, boardsData] = await Promise.all([
      apiGet<{ data: any[] }>(`/org/${orgSlug}/posts?${searchParams}`),
      apiGet<{ data: any[] }>(`/org/${orgSlug}/boards`),
    ])

    return {
      posts: postsData.data,
      boards: boardsData.data,
      filters: { status, sort, board },
      locale: params.locale,
    }
  } catch {
    return { posts: [], boards: [], filters: { status, sort, board }, locale: params.locale }
  }
}
