<script lang="ts">
  import { auth } from '../stores/auth'
  import { currentOrg } from '../stores/org'
  import { getPath } from '../router.svelte.ts'
  import SidebarNav from './SidebarNav.svelte'
  import SidebarUser from './SidebarUser.svelte'

  let org = $state<{ name: string; slug: string } | null>(null)

  currentOrg.subscribe((value) => {
    org = value
  })

  let user = $state<{ name: string; email: string } | null>(null)

  auth.subscribe((state) => {
    user = state.user
  })

  let activePath = $derived(getPath())
</script>

<aside class="w-64 bg-slate-950 flex flex-col shrink-0">
  <!-- Brand -->
  <div class="px-5 py-5 border-b border-white/10">
    <h1 class="text-lg font-bold tracking-tight text-white">Heedback</h1>
    {#if org}
      <p class="text-xs text-slate-400 mt-0.5">{org.name}</p>
    {/if}
  </div>

  <SidebarNav {activePath} />

  {#if user}
    <SidebarUser {user} onLogout={() => auth.logout()} />
  {/if}
</aside>
