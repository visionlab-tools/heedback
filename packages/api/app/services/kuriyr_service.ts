import env from '#start/env'

interface SendRawEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

interface SendTemplateEmailOptions {
  to: string | string[]
  template: string
  locale?: string
  props: Record<string, unknown>
  subject?: string
  replyTo?: string
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
} as const

export type EmailTemplateName = (typeof EmailTemplates)[keyof typeof EmailTemplates]

/**
 * KuriyrService provides an HTTP client interface for sending emails
 * via the Kuriyr transactional email API.
 *
 * Supports both raw HTML emails and template-based emails.
 * Template-based emails pass a template name and props to Kuriyr,
 * which renders the React Email component server-side.
 */
export default class KuriyrService {
  private baseUrl: string
  private apiKey: string
  private fromEmail: string
  private fromName: string

  constructor() {
    this.baseUrl = env.get('KURIYR_API_URL', 'http://localhost:3333')
    this.apiKey = env.get('KURIYR_API_KEY', '')
    this.fromEmail = env.get('KURIYR_FROM_EMAIL', 'noreply@heedback.com')
    this.fromName = env.get('KURIYR_FROM_NAME', 'Heedback')
  }

  /**
   * Send an email using a Kuriyr template.
   * Kuriyr renders the React Email component with the provided props and locale.
   */
  async sendTemplate(options: SendTemplateEmailOptions): Promise<KuriyrResponse> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to]

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          to: recipients.map((email) => ({ email })),
          template: options.template,
          locale: options.locale ?? 'en',
          props: options.props,
          subject: options.subject,
          replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        return {
          success: false,
          error: `Kuriyr API error (${response.status}): ${errorBody}`,
        }
      }

      const data = (await response.json()) as { messageId?: string }

      return {
        success: true,
        messageId: data.messageId,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Send a raw HTML email (without template).
   */
  async sendRaw(options: SendRawEmailOptions): Promise<KuriyrResponse> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to]

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          to: recipients.map((email) => ({ email })),
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        return {
          success: false,
          error: `Kuriyr API error (${response.status}): ${errorBody}`,
        }
      }

      const data = (await response.json()) as { messageId?: string }

      return {
        success: true,
        messageId: data.messageId,
      }
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
      props: { url, orgName },
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
        props: {
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
      props: data,
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
      props: data,
    })
  }
}
