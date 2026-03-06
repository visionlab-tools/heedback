<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Modal, Button, Input, Select } from '@heedback/ui-kit'
  import { api } from '../api/client'
  import { currentOrg } from '../stores/org'
  import { addToast } from '../stores/toast'
  import type { Organization } from '../stores/org'

  let {
    onclose,
    oninvited,
  }: {
    onclose: () => void
    oninvited: () => void
  } = $props()

  let org = $state<Organization | null>(null)
  currentOrg.subscribe((v) => (org = v))

  let email = $state('')
  let role = $state('member')
  let sending = $state(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!org) return
    sending = true

    try {
      await api.post(`/org/${org.id}/invitations`, { email, role })
      addToast($_('invite_modal.sent'), 'success')
      oninvited()
      onclose()
    } finally {
      sending = false
    }
  }
</script>

<Modal open blocking={false} onclose title={$_('invite_modal.title')}>
  <form onsubmit={handleSubmit} class="space-y-5">
    <Input
      label={$_('invite_modal.email')}
      id="invite-email"
      type="email"
      bind:value={email}
      required
      placeholder="colleague@example.com"
    />

    <Select id="invite-role" label={$_('invite_modal.role')} bind:value={role}>
      <option value="member">{$_('invite_modal.role_member')}</option>
      <option value="admin">{$_('invite_modal.role_admin')}</option>
      <option value="owner">{$_('invite_modal.role_owner')}</option>
    </Select>

    <Button type="submit" loading={sending} fullWidth>
      {sending ? $_('invite_modal.sending') : $_('invite_modal.submit')}
    </Button>
  </form>
</Modal>
