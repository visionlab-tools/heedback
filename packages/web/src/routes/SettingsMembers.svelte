<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { addToast } from '../lib/stores/toast'
  import SettingsTabs from '../lib/components/SettingsTabs.svelte'
  import MemberList from '../lib/components/MemberList.svelte'
  import InvitationList from '../lib/components/InvitationList.svelte'
  import InviteMemberModal from '../lib/components/InviteMemberModal.svelte'

  let { orgId }: { orgId: string } = $props()

  let members = $state<any[]>([])
  let invitations = $state<any[]>([])
  let showInviteModal = $state(false)

  async function loadMembers() {
    const res = await api.get<{ data: any[] }>(`/org/${orgId}/members`)
    members = res.data
  }

  async function loadInvitations() {
    const res = await api.get<{ data: any[] }>(`/org/${orgId}/invitations`)
    invitations = res.data
  }

  async function handleRemove(memberId: string) {
    await api.delete(`/org/${orgId}/members/${memberId}`)
    addToast($_('settings_members.removed'), 'success')
    await loadMembers()
  }

  async function handleRevoke(invitationId: string) {
    await api.delete(`/org/${orgId}/invitations/${invitationId}`)
    addToast($_('settings_members.revoked'), 'success')
    await loadInvitations()
  }

  $effect(() => {
    if (orgId) {
      loadMembers()
      loadInvitations()
    }
  })
</script>

<div class="max-w-3xl">
  <SettingsTabs />

  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">{$_('settings_members.title')}</h1>
      <p class="mt-1 text-sm text-slate-500">{$_('settings_members.subtitle')}</p>
    </div>
    <Button onclick={() => (showInviteModal = true)}>
      {$_('settings_members.invite')}
    </Button>
  </div>

  <section class="mt-8">
    <h2 class="text-lg font-medium text-slate-900 mb-4">
      {$_('settings_members.current_members')}
    </h2>
    <MemberList {members} onremove={handleRemove} />
  </section>

  <section class="mt-8">
    <h2 class="text-lg font-medium text-slate-900 mb-4">
      {$_('settings_members.pending_invitations')}
    </h2>
    <InvitationList {invitations} onrevoke={handleRevoke} />
  </section>
</div>

{#if showInviteModal}
  <InviteMemberModal
    onclose={() => (showInviteModal = false)}
    oninvited={loadInvitations}
  />
{/if}
