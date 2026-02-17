<script lang="ts">
  import { link } from 'svelte-routing'
  import { auth } from '../stores/auth'
  import { currentOrg } from '../stores/org'

  let org = $state<{ name: string; slug: string } | null>(null)
  let user = $state<{ name: string; email: string } | null>(null)

  currentOrg.subscribe((value) => {
    org = value
  })

  auth.subscribe((state) => {
    user = state.user
  })

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/articles', label: 'Articles', icon: '📝' },
    { href: '/collections', label: 'Collections', icon: '📁' },
    { href: '/inbox', label: 'Inbox', icon: '📨' },
    { href: '/boards', label: 'Boards', icon: '💬' },
    { href: '/posts', label: 'Posts', icon: '📌' },
    { href: '/changelog', label: 'Changelog', icon: '📢' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  async function handleLogout() {
    await auth.logout()
  }
</script>

<aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
  <div class="p-4 border-b border-gray-200">
    <h1 class="text-xl font-bold text-indigo-600">Heedback</h1>
    {#if org}
      <p class="text-sm text-gray-500 mt-1">{org.name}</p>
    {/if}
  </div>

  <nav class="flex-1 p-4 space-y-1">
    {#each navItems as item}
      <a
        href={item.href}
        use:link
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="p-4 border-t border-gray-200">
    {#if user}
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900">{user.name}</p>
          <p class="text-xs text-gray-500">{user.email}</p>
        </div>
        <button
          onclick={handleLogout}
          class="text-sm text-gray-500 hover:text-gray-700"
          title="Logout"
        >
          ↗
        </button>
      </div>
    {/if}
  </div>
</aside>
