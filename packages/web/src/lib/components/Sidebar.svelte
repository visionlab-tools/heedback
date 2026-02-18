<script lang="ts">
  import { auth } from '../stores/auth'
  import { getPath } from '../router.svelte.ts'
  import SidebarNav from './SidebarNav.svelte'
  import SidebarUser from './SidebarUser.svelte'
  import OrgSwitcher from './OrgSwitcher.svelte'

  let user = $state<{ name: string; email: string } | null>(null)

  auth.subscribe((state) => {
    user = state.user
  })

  let activePath = $derived(getPath())
</script>

<aside class="w-64 bg-slate-950 flex flex-col shrink-0">
  <OrgSwitcher />
  <SidebarNav {activePath} />

  {#if user}
    <SidebarUser {user} onLogout={() => auth.logout()} />
  {/if}
</aside>
