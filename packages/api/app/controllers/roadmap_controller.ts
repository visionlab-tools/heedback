import type { HttpContext } from '@adonisjs/core/http'
import RoadmapService from '#services/roadmap_service'

export default class RoadmapController {
  private roadmapService = new RoadmapService()

  async index({ params, response }: HttpContext) {
    const roadmap = await this.roadmapService.getRoadmap(params.orgSlug)

    if (!roadmap) {
      return response.notFound({ message: 'Organization not found' })
    }

    return response.ok({ data: roadmap })
  }
}
