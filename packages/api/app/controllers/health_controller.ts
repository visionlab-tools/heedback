import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  async check({ response }: HttpContext) {
    const healthStatus: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }

    try {
      await db.rawQuery('SELECT 1')
      healthStatus.database = 'connected'
    } catch {
      healthStatus.database = 'disconnected'
      healthStatus.status = 'degraded'
    }

    const statusCode = healthStatus.status === 'ok' ? 200 : 503
    return response.status(statusCode).json(healthStatus)
  }
}
