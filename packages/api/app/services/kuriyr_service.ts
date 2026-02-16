import env from '#start/env'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

interface KuriyrResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * KuriyrService provides an HTTP client interface for sending emails
 * via the Kuriyr transactional email API.
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
   * Send an email via the Kuriyr API
   */
  async sendEmail(options: SendEmailOptions): Promise<KuriyrResponse> {
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
   * Send a changelog notification to subscribers
   */
  async sendChangelogNotification(
    subscriberEmails: string[],
    subject: string,
    htmlContent: string
  ): Promise<KuriyrResponse[]> {
    const results: KuriyrResponse[] = []

    for (const email of subscriberEmails) {
      const result = await this.sendEmail({
        to: email,
        subject,
        html: htmlContent,
      })
      results.push(result)
    }

    return results
  }
}
