import { apiPost } from '$lib/api/portal-client'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData()
    const body = formData.get('body') as string
    const subject = formData.get('subject') as string | null
    const email = formData.get('email') as string | null
    const name = formData.get('name') as string | null

    try {
      const data = await apiPost<{ data: any }>(`/org/${params.orgSlug}/public/conversations`, {
        subject: subject || undefined,
        body,
        endUserEmail: email || undefined,
        endUserFirstName: name || undefined,
        channel: 'portal',
      })

      return { success: true, conversationId: data.data.id }
    } catch {
      return { success: false, error: 'Failed to send message' }
    }
  },
}
