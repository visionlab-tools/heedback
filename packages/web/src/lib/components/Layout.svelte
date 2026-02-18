<!--
  App shell for authenticated org-scoped pages.
  Reads orgSlug from the URL, syncs it with the org store,
  and renders the sidebar + page content.
-->
<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { getPath, navigate } from '../router.svelte.ts'
  import { auth } from '../stores/auth'
  import { currentOrg, allOrgs, orgLoading, type Organization } from '../stores/org'
  import { LoadingSpinner } from '@heedback/ui-kit'
  import Sidebar from './Sidebar.svelte'
  import Toast from './Toast.svelte'

  let { children }: { children: Snippet } = $props()

  let authState = $state<{ initialized: boolean; user: unknown | null }>({
    initialized: false,
    user: null,
  })
  let orgs = $state<Organization[]>([])
  let org = $state<Organization | null>(null)
  let loading = $state(true)

  auth.subscribe((s) => (authState = s))
  currentOrg.subscribe((v) => (org = v))
  allOrgs.subscribe((v) => (orgs = v))
  orgLoading.subscribe((v) => (loading = v))

  // Sync currentOrg from URL org ID whenever path or orgs change
  let urlOrgId = $derived(getPath().split('/')[1] || '')

  $effect(() => {
    if (!urlOrgId || orgs.length === 0) return
    const match = orgs.find((o) => o.id === urlOrgId)
    if (match && match.id !== org?.id) {
      currentOrg.select(match)
    }
  })

  onMount(async () => {
    await auth.init()
    auth.subscribe((state) => {
      if (state.initialized && !state.user) {
        navigate('/login', { replace: true })
      }
    })
    await currentOrg.load()
  })
</script>

{#if loading || !authState.initialized}
  <div class="flex h-screen items-center justify-center bg-slate-50">
    <LoadingSpinner />
  </div>
{:else}
  <div class="flex h-screen bg-slate-50">
    <Sidebar />
    <main class="flex-1 overflow-auto">
      <div class="mx-auto max-w-7xl px-8 py-8">
        {@render children()}
      </div>
    </main>
  </div>
{/if}
<Toast />
