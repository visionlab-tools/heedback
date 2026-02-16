import { apiGet } from '$lib/api/portal-client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
  const orgSlug = 'default'
  const status = url.searchParams.get('status') || ''
  const sort = url.searchParams.get('sort') || 'votes'
  const board = url.searchParams.get('board') || ''

  try {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (sort) params.set('sort', sort)
    if (board) params.set('board', board)

    const [postsData, boardsData] = await Promise.all([
      apiGet<{ data: any[] }>(`/org/${orgSlug}/posts?${params}`),
      apiGet<{ data: any[] }>(`/org/${orgSlug}/boards`),
    ])

    return {
      posts: postsData.data,
      boards: boardsData.data,
      filters: { status, sort, board },
    }
  } catch {
    return { posts: [], boards: [], filters: { status, sort, board } }
  }
}
