import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import Organization from '#models/organization'
import OrgMember from '#models/org_member'
import AdminUser from '#models/admin_user'
import {
  createOrganizationValidator,
  updateOrganizationValidator,
  addMemberValidator,
  updateMemberValidator,
} from '#validators/organization_validator'

export default class OrganizationsController {
  /**
   * GET /api/v1/organizations
   * Lists organizations the current user belongs to
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.isSuperAdmin) {
      const organizations = await Organization.query().orderBy('name', 'asc')
      return response.ok({ data: organizations.map((o) => o.serialize()) })
    }

    const memberships = await OrgMember.query()
      .where('admin_user_id', user.id)
      .preload('organization')

    const organizations = memberships.map((m) => ({
      ...m.organization.serialize(),
      role: m.role,
    }))

    return response.ok({ data: organizations })
  }

  /**
   * POST /api/v1/organizations
   * Creates a new organization and adds the creator as owner
   */
  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createOrganizationValidator)
    const user = auth.user!

    const existing = await Organization.query().where('slug', payload.slug).first()
    if (existing) {
      return response.conflict({ message: 'An organization with this slug already exists' })
    }

    const organization = await Organization.create({
      id: uuid(),
      name: payload.name,
      slug: payload.slug,
      logoUrl: payload.logoUrl ?? null,
      websiteUrl: payload.websiteUrl ?? null,
      billingEmail: payload.billingEmail ?? null,
      plan: 'free',
    })

    await OrgMember.create({
      id: uuid(),
      organizationId: organization.id,
      adminUserId: user.id,
      role: 'owner',
    })

    return response.created({
      data: organization.serialize(),
    })
  }

  /**
   * GET /api/v1/organizations/:orgSlug
   * Shows a single organization (org resolved by middleware)
   */
  async show({ organization, response }: HttpContext) {
    return response.ok({
      data: organization.serialize(),
    })
  }

  /**
   * PUT /api/v1/organizations/:orgSlug
   * Updates an organization
   */
  async update({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateOrganizationValidator)

    if (payload.slug && payload.slug !== organization.slug) {
      const existing = await Organization.query().where('slug', payload.slug).first()
      if (existing) {
        return response.conflict({ message: 'An organization with this slug already exists' })
      }
    }

    organization.merge({
      name: payload.name ?? organization.name,
      slug: payload.slug ?? organization.slug,
      logoUrl: payload.logoUrl !== undefined ? payload.logoUrl : organization.logoUrl,
      websiteUrl: payload.websiteUrl !== undefined ? payload.websiteUrl : organization.websiteUrl,
      billingEmail:
        payload.billingEmail !== undefined ? payload.billingEmail : organization.billingEmail,
      settings: payload.settings !== undefined ? (payload.settings as Record<string, unknown>) : organization.settings,
    })

    await organization.save()

    return response.ok({
      data: organization.serialize(),
    })
  }

  /**
   * DELETE /api/v1/organizations/:orgSlug
   * Deletes an organization (owner only)
   */
  async destroy({ organization, response }: HttpContext) {
    await organization.delete()

    return response.ok({
      message: 'Organization deleted successfully',
    })
  }

  /**
   * GET /api/v1/org/:orgSlug/members
   * Lists members of the organization
   */
  async listMembers({ organization, response }: HttpContext) {
    const members = await OrgMember.query()
      .where('organization_id', organization.id)
      .preload('adminUser')
      .orderBy('created_at', 'asc')

    const data = members.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: m.adminUser.serialize(),
    }))

    return response.ok({ data })
  }

  /**
   * POST /api/v1/org/:orgSlug/members
   * Adds a member to the organization by email
   */
  async addMember({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(addMemberValidator)

    const adminUser = await AdminUser.query().where('email', payload.email).first()
    if (!adminUser) {
      return response.notFound({ message: 'User not found with that email' })
    }

    const existingMember = await OrgMember.query()
      .where('organization_id', organization.id)
      .where('admin_user_id', adminUser.id)
      .first()

    if (existingMember) {
      return response.conflict({ message: 'User is already a member of this organization' })
    }

    const member = await OrgMember.create({
      id: uuid(),
      organizationId: organization.id,
      adminUserId: adminUser.id,
      role: payload.role,
    })

    await member.load('adminUser')

    return response.created({
      data: {
        id: member.id,
        role: member.role,
        createdAt: member.createdAt,
        user: member.adminUser.serialize(),
      },
    })
  }

  /**
   * PUT /api/v1/org/:orgSlug/members/:memberId
   * Updates a member's role
   */
  async updateMember({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateMemberValidator)

    const member = await OrgMember.query()
      .where('id', params.memberId)
      .where('organization_id', organization.id)
      .first()

    if (!member) {
      return response.notFound({ message: 'Member not found' })
    }

    member.role = payload.role
    await member.save()

    await member.load('adminUser')

    return response.ok({
      data: {
        id: member.id,
        role: member.role,
        createdAt: member.createdAt,
        user: member.adminUser.serialize(),
      },
    })
  }

  /**
   * DELETE /api/v1/org/:orgSlug/members/:memberId
   * Removes a member from the organization
   */
  async removeMember({ organization, params, response }: HttpContext) {
    const member = await OrgMember.query()
      .where('id', params.memberId)
      .where('organization_id', organization.id)
      .first()

    if (!member) {
      return response.notFound({ message: 'Member not found' })
    }

    await member.delete()

    return response.ok({ message: 'Member removed successfully' })
  }
}
