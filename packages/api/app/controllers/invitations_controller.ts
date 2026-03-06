import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import InvitationService from '#services/invitation_service'
import KuriyrService from '#services/kuriyr_service'
import {
  createInvitationValidator,
  acceptInvitationValidator,
} from '#validators/invitation_validator'

export default class InvitationsController {
  private invitationService = new InvitationService()
  private kuriyrService = new KuriyrService()

  async invite({ auth, organization, request, response }: HttpContext) {
    const payload = await request.validateUsing(createInvitationValidator)

    try {
      const { invitation, rawToken } = await this.invitationService.create(
        organization.id,
        payload.email,
        payload.role,
        auth.user!.id,
      )

      const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')
      const acceptUrl = `${frontendUrl}/invitations/accept?token=${rawToken}`

      await this.kuriyrService.sendInvitation(
        payload.email,
        acceptUrl,
        organization.name,
        auth.user!.fullName,
      )

      return response.created({ data: invitation.serialize() })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('already a member')) {
        return response.conflict({ message: e.message })
      }
      throw e
    }
  }

  async list({ organization, response }: HttpContext) {
    const invitations = await this.invitationService.listForOrg(organization.id)

    const data = invitations.map((inv) => ({
      ...inv.serialize(),
      invitedBy: inv.invitedBy
        ? { fullName: inv.invitedBy.fullName, email: inv.invitedBy.email }
        : null,
    }))

    return response.ok({ data })
  }

  async revoke({ organization, params, response }: HttpContext) {
    const invitation = await this.invitationService.revoke(
      organization.id,
      params.invitationId,
    )

    if (!invitation) {
      return response.notFound({ message: 'Invitation not found' })
    }

    return response.ok({ message: 'Invitation revoked' })
  }

  async accept({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(acceptInvitationValidator)

    try {
      const { organizationId } = await this.invitationService.accept(
        payload.token,
        auth.user!.email,
      )
      return response.ok({ data: { organizationId } })
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message.includes('expired')) {
          return response.gone({ message: e.message })
        }
        if (e.message.includes('must create an account')) {
          return response.unprocessableEntity({ message: e.message })
        }
        if (e.message.includes('different email')) {
          return response.forbidden({ message: e.message })
        }
        if (e.message.includes('Invalid')) {
          return response.notFound({ message: e.message })
        }
      }
      throw e
    }
  }
}
