<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Badge, Button } from '@heedback/ui-kit'

  interface Member {
    id: string
    role: string
    createdAt: string
    user: { id: string; email: string; fullName: string }
  }

  let {
    members,
    onremove,
  }: {
    members: Member[]
    onremove: (memberId: string) => void
  } = $props()
</script>

{#if members.length === 0}
  <p class="text-sm text-slate-500">{$_('settings_members.no_members')}</p>
{:else}
  <div class="overflow-hidden rounded-lg border border-slate-200">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_name')}</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_email')}</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{$_('settings_members.col_role')}</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{$_('common.actions')}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        {#each members as member}
          <tr>
            <td class="px-4 py-3 text-sm text-slate-900">{member.user.fullName}</td>
            <td class="px-4 py-3 text-sm text-slate-500">{member.user.email}</td>
            <td class="px-4 py-3">
              <Badge>{member.role}</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button
                size="sm"
                variant="ghost"
                onclick={() => {
                  if (confirm($_('settings_members.confirm_remove'))) onremove(member.id)
                }}
              >
                {$_('settings_members.remove')}
              </Button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
