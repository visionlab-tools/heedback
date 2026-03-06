<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Badge, Button } from '@heedback/ui-kit'

  interface Invitation {
    id: string
    email: string
    role: string
    status: string
    expiresAt: string
    invitedBy: { fullName: string; email: string } | null
  }

  let {
    invitations,
    onrevoke,
  }: {
    invitations: Invitation[]
    onrevoke: (invitationId: string) => void
  } = $props()

  function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date()
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString()
  }

  let pendingInvitations = $derived(
    invitations.filter((inv) => inv.status === 'pending')
  )
</script>

{#if pendingInvitations.length === 0}
  <p class="text-sm text-slate-500">{$_('settings_members.no_invitations')}</p>
{:else}
  <div class="overflow-hidden rounded-lg border border-slate-200">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_email')}</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_role')}</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_invited_by')}</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_expires')}</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{$_('common.actions')}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        {#each pendingInvitations as invitation}
          <tr>
            <td class="px-4 py-3 text-sm text-slate-900">{invitation.email}</td>
            <td class="px-4 py-3">
              <Badge>{invitation.role}</Badge>
            </td>
            <td class="px-4 py-3 text-sm text-slate-500">
              {invitation.invitedBy?.fullName ?? '—'}
            </td>
            <td class="px-4 py-3 text-sm">
              {#if isExpired(invitation.expiresAt)}
                <span class="text-red-500">{$_('settings_members.expired')}</span>
              {:else}
                <span class="text-slate-500">{formatDate(invitation.expiresAt)}</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-right">
              <Button
                size="sm"
                variant="ghost"
                onclick={() => {
                  if (confirm($_('settings_members.confirm_revoke'))) onrevoke(invitation.id)
                }}
              >
                {$_('settings_members.revoke')}
              </Button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
