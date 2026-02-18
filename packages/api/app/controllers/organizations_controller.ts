import type { HttpContext } from '@adonisjs/core/http'
import {
  createOrganizationValidator,
  updateOrganizationValidator,
  addMemberValidator,
  updateMemberValidator,
} from '#validators/organization_validator'
import OrganizationService from '#services/organization_service'
import Organization from '#models/organization'
import { isUuid } from '#helpers/uuid'

export default class OrganizationsController {
  private orgService = new OrganizationService()

  /** Public endpoint — no auth required. Exposes only safe widget config. */
  async publicConfig({ params, response }: HttpContext) {
    const org = isUuid(params.orgSlug)
      ? await Organization.findBy('id', params.orgSlug)
      : await Organization.findBy('slug', params.orgSlug)

    if (!org) return response.notFound({ message: 'Organization not found' })

    const settings = (org.settings ?? {}) as Record<string, unknown>
    return response.ok({
      data: {
        name: org.name,
        brandColor: (settings.brandColor as string) ?? '#6366f1',
        widgetColor: (settings.widgetColor as string) ?? (settings.brandColor as string) ?? '#6366f1',
      },
    })
  }

  async index({ auth, response }: HttpContext) {
    const result = await this.orgService.listForUser(auth.user!)

    return response.ok(result)
  }

  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createOrganizationValidator)

    try {
      const organization = await this.orgService.create(auth.user!.id, payload)
      return response.created({ data: organization.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async show({ organization, response }: HttpContext) {
    return response.ok({ data: organization.serialize() })
  }

  async update({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateOrganizationValidator)

    try {
      const updated = await this.orgService.update(organization, payload)
      return response.ok({ data: updated.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('slug already exists')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async destroy({ organization, response }: HttpContext) {
    await this.orgService.delete(organization)

    return response.ok({ message: 'Organization deleted successfully' })
  }

  async listMembers({ organization, response }: HttpContext) {
    const members = await this.orgService.listMembers(organization.id)

    const data = members.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: m.adminUser.serialize(),
    }))

    return response.ok({ data })
  }

  async addMember({ organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(addMemberValidator)

    try {
      const member = await this.orgService.addMember(organization.id, payload.email, payload.role)

      if (!member) {
        return response.notFound({ message: 'User not found with that email' })
      }

      return response.created({
        data: {
          id: member.id,
          role: member.role,
          createdAt: member.createdAt,
          user: member.adminUser.serialize(),
        },
      })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('already a member')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async updateMember({ organization, params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateMemberValidator)

    const member = await this.orgService.updateMember(organization.id, params.memberId, payload.role)

    if (!member) {
      return response.notFound({ message: 'Member not found' })
    }

    return response.ok({
      data: {
        id: member.id,
        role: member.role,
        createdAt: member.createdAt,
        user: member.adminUser.serialize(),
      },
    })
  }

  async removeMember({ organization, params, response }: HttpContext) {
    const member = await this.orgService.removeMember(organization.id, params.memberId)

    if (!member) {
      return response.notFound({ message: 'Member not found' })
    }

    return response.ok({ message: 'Member removed successfully' })
  }
}
