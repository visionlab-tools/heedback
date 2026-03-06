import env from '#start/env'

interface SendTemplateEmailOptions {
  to: string | string[]
  template: string
  locale?: string
  variables: Record<string, string>
}

interface KuriyrResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Available email template names — must match directories in templates/emails/.
 */
export const EmailTemplates = {
  MAGIC_LINK: 'magic-link',
  CHANGELOG_PUBLISHED: 'changelog-published',
  NEW_FEEDBACK: 'new-feedback',
  STATUS_CHANGE: 'status-change',
  ORG_INVITATION: 'org-invitation',
  MESSAGE_DIGEST_ADMIN: 'message-digest-admin',
  MESSAGE_DIGEST_USER: 'message-digest-user',
} as const

export type EmailTemplateName = (typeof EmailTemplates)[keyof typeof EmailTemplates]

/**
 * HTTP client for the Kuriyr transactional email API.
 * Sends template-based emails — Kuriyr renders React Email
 * components server-side with the provided variables and locale.
 */
export default class KuriyrService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = env.get('KURIYR_API_URL', 'http://localhost:3333')
    this.apiKey = env.get('KURIYR_API_KEY', '')
  }

  /**
   * Send an email using a Kuriyr template.
   * Kuriyr renders the React Email component with the provided variables and locale.
   * Sends one request per recipient (Kuriyr accepts a single `to` string).
   */
  async sendTemplate(options: SendTemplateEmailOptions): Promise<KuriyrResponse> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to]

    try {
      // Kuriyr only accepts a single recipient per request
      for (const recipient of recipients) {
        const response = await fetch(`${this.baseUrl}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            template: options.template,
            to: recipient,
            variables: options.variables,
            locale: options.locale ?? 'en',
          }),
        })

        if (!response.ok) {
          const errorBody = await response.text()
          return {
            success: false,
            error: `Kuriyr API error (${response.status}): ${errorBody}`,
          }
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Send a magic link email for passwordless auth.
   */
  async sendMagicLink(to: string, url: string, orgName: string, locale = 'en') {
    return this.sendTemplate({
      to,
      template: EmailTemplates.MAGIC_LINK,
      locale,
      variables: { url, orgName },
    })
  }

  /**
   * Send changelog notification to a list of subscribers.
   */
  async sendChangelogNotification(
    subscriberEmails: string[],
    data: {
      title: string
      excerpt: string
      changelogUrl: string
      unsubscribeUrl: string
      orgName: string
    },
    locale = 'en',
  ): Promise<KuriyrResponse[]> {
    const results: KuriyrResponse[] = []

    for (const email of subscriberEmails) {
      const result = await this.sendTemplate({
        to: email,
        template: EmailTemplates.CHANGELOG_PUBLISHED,
        locale,
        variables: {
          ...data,
          unsubscribeUrl: `${data.unsubscribeUrl}/${encodeURIComponent(email)}`,
        },
      })
      results.push(result)
    }

    return results
  }

  /**
   * Notify admins of a new feedback post.
   */
  async sendNewFeedbackNotification(
    adminEmails: string[],
    data: {
      postTitle: string
      postBody: string
      boardName: string
      authorName: string
      postUrl: string
      orgName: string
    },
    locale = 'en',
  ) {
    return this.sendTemplate({
      to: adminEmails,
      template: EmailTemplates.NEW_FEEDBACK,
      locale,
      variables: data,
    })
  }

  /**
   * Send an org invitation email.
   */
  async sendInvitation(
    to: string,
    url: string,
    orgName: string,
    inviterName: string,
    locale = 'en',
  ) {
    return this.sendTemplate({
      to,
      template: EmailTemplates.ORG_INVITATION,
      locale,
      variables: { url, orgName, inviterName },
    })
  }

  /**
   * Notify a user that their feedback status has changed.
   */
  async sendStatusChangeNotification(
    to: string,
    data: {
      postTitle: string
      oldStatus: string
      newStatus: string
      postUrl: string
      orgName: string
    },
    locale = 'en',
  ) {
    return this.sendTemplate({
      to,
      template: EmailTemplates.STATUS_CHANGE,
      locale,
      variables: data,
    })
  }
}
