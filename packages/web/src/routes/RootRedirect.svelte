<!--
  Redirects `/` to `/:orgSlug` once orgs are loaded.
  Shows the CreateOrgModal if the user has no orgs yet.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { LoadingSpinner } from '@heedback/ui-kit'
  import { navigate } from '../lib/router.svelte.ts'
  import { auth } from '../lib/stores/auth'
  import { currentOrg, orgLoading } from '../lib/stores/org'
  import CreateOrgModal from '../lib/components/CreateOrgModal.svelte'
  import Toast from '../lib/components/Toast.svelte'

  let loading = $state(true)
  let hasOrg = $state(false)
  let authReady = $state(false)

  orgLoading.subscribe((v) => (loading = v))
  currentOrg.subscribe((v) => {
    if (v) {
      hasOrg = true
      navigate(`/${v.id}`, { replace: true })
    }
  })
  auth.subscribe((s) => (authReady = s.initialized))

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

{#if loading || !authReady}
  <div class="flex h-screen items-center justify-center bg-slate-50">
    <LoadingSpinner />
  </div>
{:else if !hasOrg}
  <CreateOrgModal />
{/if}
<Toast />
