<script lang="ts">
  import { auth } from '../stores/auth'
  import { currentOrg, type Organization } from '../stores/org'
  import { getPath } from '../router.svelte.ts'
  import SidebarNav from './SidebarNav.svelte'
  import SidebarUser from './SidebarUser.svelte'
  import OrgSwitcher from './OrgSwitcher.svelte'

  let user = $state<{ name: string; email: string } | null>(null)
  let org = $state<Organization | null>(null)

  auth.subscribe((state) => {
    user = state.user
  })
  currentOrg.subscribe((v) => (org = v))

  let activePath = $derived(getPath())
  let orgSlug = $derived(org?.slug ?? '')
</script>

<aside class="w-64 bg-slate-950 flex flex-col shrink-0">
  <OrgSwitcher />
  <SidebarNav {activePath} {orgSlug} />

  {#if user}
    <SidebarUser {user} onLogout={() => auth.logout()} />
  {/if}
</aside>
