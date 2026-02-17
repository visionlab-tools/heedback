<script lang="ts">
  import { _ } from 'svelte-i18n'
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

  let navItems = $derived<Array<{ href: string; label: string; icon: IconComponent }>>([
    { href: '/', label: $_('nav.dashboard'), icon: LayoutDashboard },
    { href: '/articles', label: $_('nav.articles'), icon: FileText },
    { href: '/collections', label: $_('nav.collections'), icon: FolderOpen },
    { href: '/inbox', label: $_('nav.inbox'), icon: Inbox },
    { href: '/boards', label: $_('nav.boards'), icon: MessageSquare },
    { href: '/posts', label: $_('nav.posts'), icon: Pin },
    { href: '/changelog', label: $_('nav.changelog'), icon: Megaphone },
    { href: '/settings', label: $_('nav.settings'), icon: Settings },
  ])
</script>

<Nav items={navItems} {activePath} />
