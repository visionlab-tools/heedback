import Organization from '#models/organization'
import logger from '@adonisjs/core/services/logger'

interface WebhookPayload {
  event: 'conversation.created' | 'message.created'
  organizationId: string
  data: Record<string, unknown>
}

/**
 * Fire-and-forget webhook delivery.
 * Sends POST to configured webhookUrl and/or slackWebhookUrl.
 * Never throws — errors are logged and silently ignored.
 */
export default class WebhookService {
  /** Dispatch webhooks for an org after a chat event */
  async dispatch(org: Organization, payload: WebhookPayload) {
    const settings = (org.settings ?? {}) as Record<string, unknown>
    const webhookUrl = settings.webhookUrl as string | undefined
    const slackWebhookUrl = settings.slackWebhookUrl as string | undefined

    const promises: Promise<void>[] = []

    if (webhookUrl) {
      promises.push(this.sendGenericWebhook(webhookUrl, payload))
    }
    if (slackWebhookUrl) {
      promises.push(this.sendSlackWebhook(slackWebhookUrl, payload))
    }

    // Fire-and-forget — don't block the API response
    await Promise.allSettled(promises)
  }

  private async sendGenericWebhook(url: string, payload: WebhookPayload) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        logger.warn(`Webhook ${url} returned ${response.status}`)
      }
    } catch (error) {
      logger.warn(`Webhook ${url} failed: ${error}`)
    }
  }

  private async sendSlackWebhook(url: string, payload: WebhookPayload) {
    const emoji = payload.event === 'conversation.created' ? ':speech_balloon:' : ':envelope:'
    const label = payload.event === 'conversation.created'
      ? 'New conversation'
      : 'New message'

    const body = (payload.data.body as string) || ''
    const email = (payload.data.endUserEmail as string) || 'Anonymous'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} *${label}* from ${email}\n>${body.slice(0, 300)}`,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        logger.warn(`Slack webhook returned ${response.status}`)
      }
    } catch (error) {
      logger.warn(`Slack webhook failed: ${error}`)
    }
  }
}
