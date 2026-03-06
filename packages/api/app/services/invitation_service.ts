import crypto from 'node:crypto'
import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import OrgInvitation from '#models/org_invitation'
import OrgMember from '#models/org_member'
import AdminUser from '#models/admin_user'

const EXPIRY_DAYS = 7

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

function generateToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex')
  return { raw, hash: hashToken(raw) }
}

export default class InvitationService {
  /**
   * Create or regenerate an invitation.
   * If a pending invite already exists for this email+org, refresh its token and expiry.
   */
  async create(
    orgId: string,
    email: string,
    role: 'owner' | 'admin' | 'member',
    invitedById: string,
  ): Promise<{ invitation: OrgInvitation; rawToken: string }> {
    // Reject if user is already a member
    const adminUser = await AdminUser.query().where('email', email).first()
    if (adminUser) {
      const existing = await OrgMember.query()
        .where('organization_id', orgId)
        .where('admin_user_id', adminUser.id)
        .first()
      if (existing) {
        throw new Error('User is already a member of this organization')
      }
    }

    const { raw, hash } = generateToken()
    const expiresAt = DateTime.now().plus({ days: EXPIRY_DAYS })

    // Re-use pending invitation if one exists
    const pending = await OrgInvitation.query()
      .where('organization_id', orgId)
      .where('email', email)
      .where('status', 'pending')
      .first()

    if (pending) {
      pending.tokenHash = hash
      pending.expiresAt = expiresAt
      pending.role = role
      pending.invitedById = invitedById
      await pending.save()
      await pending.load('invitedBy')
      return { invitation: pending, rawToken: raw }
    }

    const invitation = await OrgInvitation.create({
      id: uuid(),
      organizationId: orgId,
      email,
      role,
      tokenHash: hash,
      invitedById,
      status: 'pending',
      expiresAt,
    })

    await invitation.load('invitedBy')
    return { invitation, rawToken: raw }
  }

  /**
   * Accept an invitation using the raw token.
   * The invitee must already have an AdminUser account.
   */
  async accept(
    rawToken: string,
    authenticatedEmail: string,
  ): Promise<{ orgMember: OrgMember; organizationId: string }> {
    const tokenHash = hashToken(rawToken)

    const invitation = await OrgInvitation.query()
      .where('token_hash', tokenHash)
      .where('status', 'pending')
      .first()

    if (!invitation) {
      throw new Error('Invalid or expired invitation')
    }

    if (invitation.isExpired) {
      throw new Error('This invitation has expired')
    }

    // Ensure the authenticated user matches the invited email
    if (authenticatedEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('This invitation was sent to a different email address')
    }

    const adminUser = await AdminUser.query().where('email', invitation.email).first()
    if (!adminUser) {
      throw new Error('You must create an account before accepting this invitation')
    }

    // Atomic: create membership + mark invitation accepted
    return db.transaction(async (trx) => {
      const existing = await OrgMember.query({ client: trx })
        .where('organization_id', invitation.organizationId)
        .where('admin_user_id', adminUser.id)
        .first()

      if (existing) {
        invitation.useTransaction(trx)
        invitation.status = 'accepted'
        invitation.acceptedAt = DateTime.now()
        await invitation.save()
        return { orgMember: existing, organizationId: invitation.organizationId }
      }

      const orgMember = await OrgMember.create(
        {
          id: uuid(),
          organizationId: invitation.organizationId,
          adminUserId: adminUser.id,
          role: invitation.role,
        },
        { client: trx },
      )

      invitation.useTransaction(trx)
      invitation.status = 'accepted'
      invitation.acceptedAt = DateTime.now()
      await invitation.save()

      return { orgMember, organizationId: invitation.organizationId }
    })
  }

  async listForOrg(orgId: string): Promise<OrgInvitation[]> {
    return OrgInvitation.query()
      .where('organization_id', orgId)
      .preload('invitedBy')
      .orderBy('created_at', 'desc')
  }

  async revoke(orgId: string, invitationId: string): Promise<OrgInvitation | null> {
    const invitation = await OrgInvitation.query()
      .where('id', invitationId)
      .where('organization_id', orgId)
      .where('status', 'pending')
      .first()

    if (!invitation) return null

    invitation.status = 'revoked'
    await invitation.save()
    return invitation
  }
}
