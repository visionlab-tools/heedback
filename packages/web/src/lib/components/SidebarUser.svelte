<!--
  Bottom section of the sidebar showing the current user and logout.
-->
<script lang="ts">
  import { LogOut } from 'lucide-svelte'

  let { user, onLogout }: {
    user: { name: string; email: string }
    onLogout: () => void
  } = $props()
</script>

<div class="px-4 py-4 border-t border-white/10">
  <div class="flex items-center justify-between">
    <div class="min-w-0">
      <p class="text-sm font-medium text-slate-200 truncate">{user.name}</p>
      <p class="text-xs text-slate-500 truncate">{user.email}</p>
    </div>
    <button
      onclick={onLogout}
      class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
      title="Logout"
    >
      <LogOut size={16} />
    </button>
  </div>
</div>
