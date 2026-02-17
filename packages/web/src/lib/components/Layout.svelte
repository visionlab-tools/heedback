<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { navigate } from '../router.svelte.ts'
  import { auth } from '../stores/auth'
  import { currentOrg } from '../stores/org'
  import Sidebar from './Sidebar.svelte'

  let { children }: { children: Snippet } = $props()

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

<div class="flex h-screen bg-slate-50">
  <Sidebar />
  <main class="flex-1 overflow-auto">
    <div class="mx-auto max-w-7xl px-8 py-8">
      {@render children()}
    </div>
  </main>
</div>
