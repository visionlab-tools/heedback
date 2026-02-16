import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Organization from '#models/organization'

export default class RoadmapController {
  /**
   * GET /api/v1/org/:orgSlug/roadmap
   * GET /api/v1/org/:orgSlug/public/roadmap
   *
   * Returns posts grouped by roadmap-relevant statuses
   */
  async index({ params, response }: HttpContext) {
    const org = await Organization.query().where('slug', params.orgSlug).first()

    if (!org) {
      return response.notFound({ message: 'Organization not found' })
    }

    const roadmapStatuses = ['planned', 'in_progress', 'completed'] as const

    const roadmap: Record<string, unknown[]> = {}

    for (const status of roadmapStatuses) {
      const posts = await Post.query()
        .where('organization_id', org.id)
        .where('status', status)
        .whereNull('merged_into_id')
        .whereHas('board', (boardQuery) => {
          boardQuery.where('is_public', true)
        })
        .preload('board')
        .preload('tags')
        .orderBy('vote_count', 'desc')
        .limit(50)

      roadmap[status] = posts.map((p) => ({
        ...p.serialize(),
        board: p.board?.serialize(),
      }))
    }

    return response.ok({
      data: roadmap,
    })
  }
}
