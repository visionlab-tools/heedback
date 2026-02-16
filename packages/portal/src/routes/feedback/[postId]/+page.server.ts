import { apiGet } from '$lib/api/portal-client'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const orgSlug = 'default'

  try {
    const [postData, commentsData] = await Promise.all([
      apiGet<{ data: any }>(`/org/${orgSlug}/posts/${params.postId}`),
      apiGet<{ data: any[] }>(`/org/${orgSlug}/posts/${params.postId}/comments`),
    ])

    return {
      post: postData.data,
      comments: commentsData.data.filter((c: any) => !c.isInternal),
    }
  } catch {
    throw error(404, 'Post not found')
  }
}
