import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import PushSubscription from '#models/push_subscription'
import env from '#start/env'

export default class PushSubscriptionsController {
  /** Register a browser push subscription for the authenticated admin */
  async subscribe({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { endpoint, keys } = request.only(['endpoint', 'keys'])

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return response.badRequest({ errors: [{ message: 'Missing push subscription fields' }] })
    }

    // Upsert — same endpoint = same browser
    const existing = await PushSubscription.query().where('endpoint', endpoint).first()

    if (existing) {
      existing.adminUserId = user.id
      existing.p256dh = keys.p256dh
      existing.auth = keys.auth
      await existing.save()
    } else {
      await PushSubscription.create({
        id: uuid(),
        adminUserId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      })
    }

    return response.created({ success: true })
  }

  /** Remove a push subscription */
  async unsubscribe({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { endpoint } = request.only(['endpoint'])

    if (!endpoint) {
      return response.badRequest({ errors: [{ message: 'Missing endpoint' }] })
    }

    await PushSubscription.query()
      .where('endpoint', endpoint)
      .where('admin_user_id', user.id)
      .delete()

    return response.noContent()
  }

  /** Return the VAPID public key so the frontend can subscribe */
  async vapidKey({ response }: HttpContext) {
    const key = env.get('VAPID_PUBLIC_KEY', '')
    if (!key) {
      return response.serviceUnavailable({ errors: [{ message: 'Push notifications not configured' }] })
    }
    return { vapidPublicKey: key }
  }
}
