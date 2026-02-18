<!--
  Redirects `/` to `/:orgId` once orgs are loaded.
  Shows the CreateOrgModal if the user has no orgs yet.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { LoadingSpinner } from '@heedback/ui-kit'
  import { navigate } from '../lib/router.svelte.ts'
  import { auth } from '../lib/stores/auth'
  import { currentOrg, orgLoading } from '../lib/stores/org'
  import CreateOrgModal from '../lib/components/CreateOrgModal.svelte'
  import Toast from '../lib/components/Toast.svelte'

  let loading = $state(true)
  let hasOrg = $state(false)
  let authReady = $state(false)

  // Must unsubscribe on destroy — otherwise the navigate() call leaks
  // and redirects to dashboard on every org store update
  const unsubLoading = orgLoading.subscribe((v) => (loading = v))
  const unsubOrg = currentOrg.subscribe((v) => {
    if (v) {
      hasOrg = true
      navigate(`/${v.id}`, { replace: true })
    }
  })
  const unsubAuth = auth.subscribe((s) => (authReady = s.initialized))

  // Track the auth guard sub separately — created async inside onMount
  let unsubAuthGuard: (() => void) | undefined

  onDestroy(() => {
    unsubLoading()
    unsubOrg()
    unsubAuth()
    unsubAuthGuard?.()
  })

  onMount(async () => {
    await auth.init()
    unsubAuthGuard = auth.subscribe((state) => {
      if (state.initialized && !state.user) {
        navigate('/login', { replace: true })
      }
    })
    await currentOrg.load()
  })
</script>

{#if loading || !authReady}
  <div class="flex h-screen items-center justify-center bg-slate-50">
    <LoadingSpinner />
  </div>
{:else if !hasOrg}
  <CreateOrgModal />
{/if}
<Toast />
