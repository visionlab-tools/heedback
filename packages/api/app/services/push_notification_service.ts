import webpush from 'web-push'
import env from '#start/env'
import PushSubscription from '#models/push_subscription'
import OrgMember from '#models/org_member'

interface PushPayload {
  title: string
  body: string
  conversationId: string
  orgId: string
}

/**
 * Sends Web Push notifications to all org members.
 * Gracefully removes stale subscriptions (410/404).
 */
export default class PushNotificationService {
  private configured: boolean

  constructor() {
    const publicKey = env.get('VAPID_PUBLIC_KEY', '')
    const privateKey = env.get('VAPID_PRIVATE_KEY', '')
    const subject = env.get('VAPID_SUBJECT', '')

    this.configured = !!(publicKey && privateKey && subject)

    if (this.configured) {
      webpush.setVapidDetails(subject, publicKey, privateKey)
    } else {
      console.info('[PushNotification] VAPID not configured — push notifications disabled')
    }
  }

  async sendToOrg(orgId: string, payload: PushPayload) {
    if (!this.configured) return

    try {
      const memberIds = await OrgMember.query()
        .where('organization_id', orgId)
        .select('admin_user_id')

      if (memberIds.length === 0) {
        console.info(`[PushNotification] No members found for org ${orgId}`)
        return
      }

      const subscriptions = await PushSubscription.query().whereIn(
        'admin_user_id',
        memberIds.map((m) => m.adminUserId),
      )

      if (subscriptions.length === 0) {
        console.info(`[PushNotification] No push subscriptions for org ${orgId} (${memberIds.length} members)`)
        return
      }

      const jsonPayload = JSON.stringify(payload)

      console.info(`[PushNotification] Sending to ${subscriptions.length} subscription(s) for org ${orgId}`)

      await Promise.allSettled(
        subscriptions.map((sub) => this.sendToSubscription(sub, jsonPayload)),
      )
    } catch (error) {
      console.warn('[PushNotification] Failed to send:', (error as Error).message)
    }
  }

  private async sendToSubscription(sub: PushSubscription, payload: string) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      )
      console.info(`[PushNotification] Sent to subscription ${sub.id}`)
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.info(`[PushNotification] Removing stale subscription ${sub.id} (${error.statusCode})`)
        await sub.delete()
      }
    }
  }
}
