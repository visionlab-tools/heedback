import redis from '@adonisjs/redis/services/main'
import logger from '@adonisjs/core/services/logger'

type SseHandler = (payload: unknown) => void

/**
 * Redis pub/sub wrapper for SSE event delivery.
 * Shares one Redis subscription per channel across multiple SSE clients.
 */
class SseService {
  private handlers = new Map<string, Set<SseHandler>>()

  async publish(channel: string, payload: unknown) {
    try {
      await redis.publish(channel, JSON.stringify(payload))
    } catch (error) {
      logger.warn(`SSE publish to ${channel} failed: ${error}`)
    }
  }

  /** Add a handler for a channel. First handler triggers the Redis subscription. */
  subscribe(channel: string, handler: SseHandler) {
    let set = this.handlers.get(channel)

    if (!set) {
      set = new Set()
      this.handlers.set(channel, set)
      // redis.subscribe is sync — manages its own subscriber connection
      redis.subscribe(channel, (message: string) => {
        try {
          const parsed = JSON.parse(message)
          this.handlers.get(channel)?.forEach((h) => h(parsed))
        } catch {
          logger.warn(`SSE: malformed message on ${channel}`)
        }
      })
    }

    set.add(handler)
  }

  /** Remove a handler. Last handler triggers Redis unsubscribe. */
  async unsubscribe(channel: string, handler: SseHandler) {
    const set = this.handlers.get(channel)
    if (!set) return

    set.delete(handler)

    if (set.size === 0) {
      this.handlers.delete(channel)
      await redis.unsubscribe(channel)
    }
  }
}

export const sseService = new SseService()
