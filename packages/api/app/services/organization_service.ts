import { v4 as uuid } from 'uuid'
import Organization from '#models/organization'
import OrgMember from '#models/org_member'
import AdminUser from '#models/admin_user'

export default class OrganizationService {
  /**
   * List organizations for a user.
   * Super admins see all organizations; regular users see only their memberships.
   */
  async listForUser(user: AdminUser): Promise<{
    data: Array<Record<string, unknown>>
  }> {
    if (user.isSuperAdmin) {
      const organizations = await Organization.query().orderBy('name', 'asc')
      return { data: organizations.map((o) => o.serialize()) }
    }

    const memberships = await OrgMember.query()
      .where('admin_user_id', user.id)
      .preload('organization')

    const organizations = memberships.map((m) => ({
      ...m.organization.serialize(),
      role: m.role,
    }))

    return { data: organizations }
  }

  /**
   * Create a new organization and add the creator as owner.
   * Throws if the slug is already taken.
   */
  async create(
    userId: string,
    data: {
      name: string
      slug: string
      logoUrl?: string | null
      websiteUrl?: string | null
      billingEmail?: string | null
      settings?: Record<string, unknown> | null
    },
  ): Promise<Organization> {
    const existing = await Organization.query().where('slug', data.slug).first()
    if (existing) {
      throw new Error('An organization with this slug already exists')
    }

    const organization = await Organization.create({
      id: uuid(),
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl ?? null,
      websiteUrl: data.websiteUrl ?? null,
      billingEmail: data.billingEmail ?? null,
      settings: data.settings ?? null,
      plan: 'free',
    })

    await OrgMember.create({
      id: uuid(),
      organizationId: organization.id,
      adminUserId: userId,
      role: 'owner',
    })

    return organization
  }

  /**
   * Update an organization.
   * Throws if the new slug conflicts with another organization.
   */
  async update(
    org: Organization,
    data: {
      name?: string
      slug?: string
      logoUrl?: string | null
      websiteUrl?: string | null
      billingEmail?: string | null
      settings?: Record<string, unknown> | null
    },
  ): Promise<Organization> {
    if (data.slug && data.slug !== org.slug) {
      const existing = await Organization.query().where('slug', data.slug).first()
      if (existing) {
        throw new Error('An organization with this slug already exists')
      }
    }

    org.merge({
      name: data.name ?? org.name,
      slug: data.slug ?? org.slug,
      logoUrl: data.logoUrl !== undefined ? data.logoUrl : org.logoUrl,
      websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl : org.websiteUrl,
      billingEmail: data.billingEmail !== undefined ? data.billingEmail : org.billingEmail,
      // Shallow-merge settings so each admin page can send only its own keys
      settings: data.settings !== undefined
        ? { ...(org.settings ?? {}), ...data.settings }
        : org.settings,
    })

    await org.save()

    return org
  }

  /**
   * Delete an organization.
   */
  async delete(org: Organization): Promise<void> {
    await org.delete()
  }

  /**
   * List members of an organization with preloaded admin user.
   */
  async listMembers(orgId: string): Promise<OrgMember[]> {
    return OrgMember.query()
      .where('organization_id', orgId)
      .preload('adminUser')
      .orderBy('created_at', 'asc')
  }

  /**
   * Add a member to an organization by email.
   * Returns null if the admin user is not found by email.
   * Throws if the user is already a member.
   */
  async addMember(
    orgId: string,
    email: string,
    role: 'owner' | 'admin' | 'member',
  ): Promise<OrgMember | null> {
    const adminUser = await AdminUser.query().where('email', email).first()
    if (!adminUser) {
      return null
    }

    const existingMember = await OrgMember.query()
      .where('organization_id', orgId)
      .where('admin_user_id', adminUser.id)
      .first()

    if (existingMember) {
      throw new Error('User is already a member of this organization')
    }

    const member = await OrgMember.create({
      id: uuid(),
      organizationId: orgId,
      adminUserId: adminUser.id,
      role,
    })

    await member.load('adminUser')

    return member
  }

  /**
   * Update a member's role.
   * Returns null if the member is not found.
   */
  async updateMember(
    orgId: string,
    memberId: string,
    role: 'owner' | 'admin' | 'member',
  ): Promise<OrgMember | null> {
    const member = await OrgMember.query()
      .where('id', memberId)
      .where('organization_id', orgId)
      .first()

    if (!member) {
      return null
    }

    member.role = role
    await member.save()

    await member.load('adminUser')

    return member
  }

  /**
   * Remove a member from an organization.
   * Returns null if the member is not found.
   */
  async removeMember(orgId: string, memberId: string): Promise<OrgMember | null> {
    const member = await OrgMember.query()
      .where('id', memberId)
      .where('organization_id', orgId)
      .first()

    if (!member) {
      return null
    }

    await member.delete()

    return member
  }
}
