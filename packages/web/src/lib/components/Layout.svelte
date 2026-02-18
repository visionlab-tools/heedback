<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { navigate } from '../router.svelte.ts'
  import { auth } from '../stores/auth'
  import { currentOrg, orgLoading } from '../stores/org'
  import { LoadingSpinner } from '@heedback/ui-kit'
  import Sidebar from './Sidebar.svelte'
  import Toast from './Toast.svelte'
  import CreateOrgModal from './CreateOrgModal.svelte'

  let { children }: { children: Snippet } = $props()

  let authState = $state<{ initialized: boolean; user: unknown | null }>({
    initialized: false,
    user: null,
  })
  let org = $state<unknown | null>(null)
  let loading = $state(true)

  auth.subscribe((s) => (authState = s))
  currentOrg.subscribe((v) => (org = v))
  orgLoading.subscribe((v) => (loading = v))

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
{:else if !org && authState.user}
  <CreateOrgModal />
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
