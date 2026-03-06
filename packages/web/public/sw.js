/* Service worker for browser push notifications */

self.addEventListener('push', (event) => {
  if (!event.data) return

  const payload = event.data.json()

  event.waitUntil(
    self.registration.showNotification(payload.title || 'New message', {
      body: payload.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        conversationId: payload.conversationId,
        orgId: payload.orgId,
      },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { conversationId, orgId } = event.notification.data || {}

  if (orgId && conversationId) {
    event.waitUntil(clients.openWindow(`/${orgId}/inbox/${conversationId}`))
  }
})
