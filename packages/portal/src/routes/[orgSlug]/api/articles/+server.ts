import { json } from '@sveltejs/kit'
import { apiGet } from '$lib/api/portal-client'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, url }) => {
  const collection = url.searchParams.get('collection') ?? ''
  const locale = url.searchParams.get('locale') ?? ''
  const page = url.searchParams.get('page') ?? '1'
  const limit = url.searchParams.get('limit') ?? '20'

  try {
    const data = await apiGet<{ data: any[]; meta: any }>(
      `/org/${params.orgSlug}/public/articles?collection=${collection}&locale=${locale}&page=${page}&limit=${limit}`,
    )
    return json(data)
  } catch {
    return json({ data: [], meta: null }, { status: 500 })
  }
}
