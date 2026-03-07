import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import redis from '@adonisjs/redis/services/main'
import OrgMember from '#models/org_member'
import EndUser from '#models/end_user'
import KuriyrService, { EmailTemplates } from '#services/kuriyr_service'
import env from '#start/env'

const DIGEST_INTERVAL_MINUTES = 10

/** Escape HTML special chars to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
const LOCK_KEY = 'digest:lock'
const LOCK_TTL_SECONDS = 120

interface DigestMessage {
  conversationId: string
  subject: string | null
  senderName: string | null
  body: string
  createdAt: string
}

/**
 * Sends email digests of unread messages every 10 minutes.
 * Uses a Redis lock to prevent duplicate runs in multi-instance deployments.
 */
export default class DigestService {
  private kuriyr = new KuriyrService()

  async run() {
    // Distributed lock — only one instance runs the digest
    const acquired = await redis.set(LOCK_KEY, '1', 'EX', LOCK_TTL_SECONDS, 'NX')
    if (!acquired) return

    try {
      await Promise.allSettled([this.runAdminDigests(), this.runEndUserDigests()])
    } finally {
      await redis.del(LOCK_KEY)
    }
  }

  /** Notify org admins about new end-user messages */
  private async runAdminDigests() {
    const cutoff = DateTime.now().minus({ minutes: DIGEST_INTERVAL_MINUTES })

    // Find org members who have new end-user messages since their last digest
    const members = await OrgMember.query().preload('adminUser').preload('organization')

    for (const member of members) {
      try {
        await this.sendAdminDigest(member, cutoff)
      } catch (error) {
        console.warn(`[Digest] Admin digest failed for ${member.adminUserId}:`, (error as Error).message)
      }
    }
  }

  private async sendAdminDigest(member: OrgMember, cutoff: DateTime) {
    const since = member.lastDigestSentAt ?? cutoff

    const messages = await db
      .from('messages')
      .join('conversations', 'conversations.id', 'messages.conversation_id')
      .leftJoin('end_users', 'end_users.id', 'messages.sender_id')
      .where('conversations.organization_id', member.organizationId)
      .where('messages.sender_type', 'end_user')
      .where('messages.is_internal', false)
      .where('messages.created_at', '>', since.toSQL()!)
      .select(
        'conversations.id as conversationId',
        'conversations.subject',
        db.raw("CONCAT_WS(' ', end_users.first_name, end_users.last_name) as \"senderName\""),
        'messages.body',
        'messages.created_at as createdAt',
      )
      .orderBy('messages.created_at', 'asc') as DigestMessage[]

    if (messages.length === 0) return

    const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')
    const inboxUrl = `${frontendUrl}/${member.organizationId}/inbox`

    const messagesHtml = messages
      .map(
        (m) =>
          `<strong>${escapeHtml(m.senderName ?? 'Anonymous')}</strong>${m.subject ? ` — ${escapeHtml(m.subject)}` : ''}<br/>${escapeHtml(m.body.slice(0, 200))}`,
      )
      .join('<hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0"/>')

    await this.kuriyr.sendTemplate({
      to: member.adminUser.email,
      template: EmailTemplates.MESSAGE_DIGEST_ADMIN,
      variables: {
        orgName: member.organization.name,
        messageCount: String(messages.length),
        messagesHtml,
        inboxUrl,
      },
    })

    member.lastDigestSentAt = DateTime.now()
    await member.save()
  }

  /** Notify end users about new admin replies */
  private async runEndUserDigests() {
    const cutoff = DateTime.now().minus({ minutes: DIGEST_INTERVAL_MINUTES })

    // Only end users with an email address
    const endUsers = await EndUser.query().whereNotNull('email').preload('organization')

    for (const endUser of endUsers) {
      try {
        await this.sendEndUserDigest(endUser, cutoff)
      } catch (error) {
        console.warn(`[Digest] End-user digest failed for ${endUser.id}:`, (error as Error).message)
      }
    }
  }

  private async sendEndUserDigest(endUser: EndUser, cutoff: DateTime) {
    const since = endUser.lastDigestSentAt ?? cutoff

    const messages = await db
      .from('messages')
      .join('conversations', 'conversations.id', 'messages.conversation_id')
      .leftJoin('admin_users', 'admin_users.id', 'messages.sender_id')
      .where('conversations.organization_id', endUser.organizationId)
      .where('conversations.end_user_id', endUser.id)
      .where('messages.sender_type', 'admin')
      .where('messages.is_internal', false)
      .where('messages.created_at', '>', since.toSQL()!)
      .select(
        'conversations.id as conversationId',
        'conversations.subject',
        'admin_users.full_name as senderName',
        'messages.body',
        'messages.created_at as createdAt',
      )
      .orderBy('messages.created_at', 'asc') as DigestMessage[]

    if (messages.length === 0) return

    const publicSiteUrl = env.get('PUBLIC_SITE_URL', 'http://localhost:4173')
    const orgSlug = endUser.organization.slug
    const conversationUrl = `${publicSiteUrl}/${orgSlug}/conversations`

    const messagesHtml = messages
      .map(
        (m) =>
          `<strong>${escapeHtml(m.senderName ?? 'Support')}</strong>${m.subject ? ` — ${escapeHtml(m.subject)}` : ''}<br/>${escapeHtml(m.body.slice(0, 200))}`,
      )
      .join('<hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0"/>')

    await this.kuriyr.sendTemplate({
      to: endUser.email!,
      template: EmailTemplates.MESSAGE_DIGEST_USER,
      variables: {
        orgName: endUser.organization.name,
        messageCount: String(messages.length),
        messagesHtml,
        conversationUrl,
      },
    })

    endUser.lastDigestSentAt = DateTime.now()
    await endUser.save()
  }
}
