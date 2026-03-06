import { api } from './api/client'

/**
 * Register the service worker and subscribe to Web Push notifications.
 * Silently skips if the browser doesn't support push or the user denies permission.
 */
export async function initPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    const existing = await registration.pushManager.getSubscription()
    if (existing) return // Already subscribed

    const { vapidPublicKey } = await api.get<{ vapidPublicKey: string }>('/push/vapid-key', {
      silent: true,
    })

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    const json = subscription.toJSON()
    await api.post(
      '/push-subscriptions',
      { endpoint: json.endpoint, keys: json.keys },
      { silent: true },
    )
  } catch (err) {
    console.warn('[Push] Failed to initialize push notifications:', err)
  }
}

export async function unsubscribePush() {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    await api.post('/push-subscriptions/unsubscribe', { endpoint: subscription.endpoint }, { silent: true })
    await subscription.unsubscribe()
  } catch (err) {
    console.warn('[Push] Failed to unsubscribe:', err)
  }
}

/** Convert a base64url-encoded VAPID key to a Uint8Array for the Push API */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}
