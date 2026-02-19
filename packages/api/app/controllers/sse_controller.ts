import type { HttpContext } from '@adonisjs/core/http'
import type { ServerResponse } from 'node:http'
import { sseService } from '#services/sse_service'

type SseHandler = (payload: unknown) => void

/**
 * Wire up SSE headers, heartbeat, and cleanup on a raw Node response.
 * Returns a Promise that resolves when the client disconnects —
 * the controller MUST await this to prevent AdonisJS from finalizing.
 */
function setupSseStream(
  raw: ServerResponse,
  channel: string,
  handler: SseHandler,
  origin?: string,
): Promise<void> {
  if (origin) {
    raw.setHeader('Access-Control-Allow-Origin', origin)
    raw.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  // Flush headers immediately so the client sees the connection open
  raw.flushHeaders()
  raw.write(':\n\n')

  const heartbeat = setInterval(() => raw.write(':\n\n'), 30_000)

  sseService.subscribe(channel, handler)

  // Keep the controller alive until the client disconnects
  return new Promise((resolve) => {
    raw.on('close', () => {
      clearInterval(heartbeat)
      sseService.unsubscribe(channel, handler)
      resolve()
    })
  })
}

export default class SseController {
  /** Public SSE — widget subscribes to one conversation */
  async conversationStream({ params, request, response }: HttpContext) {
    const channel = `conversation:${params.conversationId}`
    const raw = response.response
    const origin = request.header('origin')

    const handler: SseHandler = (payload) => {
      raw.write(`data: ${JSON.stringify(payload)}\n\n`)
    }

    return setupSseStream(raw, channel, handler, origin)
  }

  /** Auth-required SSE — admin inbox listens to all org events */
  async inboxStream({ organization, request, response }: HttpContext) {
    const channel = `org:${organization.id}:inbox`
    const raw = response.response
    const origin = request.header('origin')

    const handler: SseHandler = (payload) => {
      raw.write(`data: ${JSON.stringify(payload)}\n\n`)
    }

    return setupSseStream(raw, channel, handler, origin)
  }
}
