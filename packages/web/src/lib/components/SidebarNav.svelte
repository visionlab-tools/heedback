<script lang="ts">
  import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Inbox,
    MessageSquare,
    Pin,
    Megaphone,
    Settings,
  } from 'lucide-svelte'
  import { Nav } from '@heedback/ui-kit'

  let { activePath }: { activePath: string } = $props()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  const navItems: Array<{ href: string; label: string; icon: IconComponent }> = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/articles', label: 'Articles', icon: FileText },
    { href: '/collections', label: 'Collections', icon: FolderOpen },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/boards', label: 'Boards', icon: MessageSquare },
    { href: '/posts', label: 'Posts', icon: Pin },
    { href: '/changelog', label: 'Changelog', icon: Megaphone },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]
</script>

<Nav items={navItems} {activePath} />
