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

  let { activePath, orgSlug }: { activePath: string; orgSlug: string } = $props()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  let navItems = $derived<Array<{ href: string; label: string; icon: IconComponent }>>([
    { href: `/${orgSlug}`, label: $_('nav.dashboard'), icon: LayoutDashboard },
    { href: `/${orgSlug}/articles`, label: $_('nav.articles'), icon: FileText },
    { href: `/${orgSlug}/collections`, label: $_('nav.collections'), icon: FolderOpen },
    { href: `/${orgSlug}/inbox`, label: $_('nav.inbox'), icon: Inbox },
    { href: `/${orgSlug}/boards`, label: $_('nav.boards'), icon: MessageSquare },
    { href: `/${orgSlug}/posts`, label: $_('nav.posts'), icon: Pin },
    { href: `/${orgSlug}/changelog`, label: $_('nav.changelog'), icon: Megaphone },
    { href: `/${orgSlug}/settings`, label: $_('nav.settings'), icon: Settings },
  ])
</script>

<Nav items={navItems} {activePath} />
