import Post from '#models/post'
import Organization from '#models/organization'

export default class RoadmapService {
  async getRoadmap(orgSlug: string) {
    const org = await Organization.query().where('slug', orgSlug).first()

    if (!org) return null

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

    return roadmap
  }
}
