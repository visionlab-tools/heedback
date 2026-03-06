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
    }
  }

  async sendToOrg(orgId: string, payload: PushPayload) {
    if (!this.configured) return

    try {
      const memberIds = await OrgMember.query()
        .where('organization_id', orgId)
        .select('admin_user_id')

      if (memberIds.length === 0) return

      const subscriptions = await PushSubscription.query().whereIn(
        'admin_user_id',
        memberIds.map((m) => m.adminUserId),
      )

      const jsonPayload = JSON.stringify(payload)

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
    } catch (error: any) {
      // Remove stale subscriptions (browser unsubscribed or expired)
      if (error.statusCode === 410 || error.statusCode === 404) {
        await sub.delete()
      }
    }
  }
}
