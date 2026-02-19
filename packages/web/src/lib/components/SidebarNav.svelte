<script lang="ts">
  import { _ } from 'svelte-i18n'
  import {
    LayoutDashboard,
    FileText,
    Inbox,
    MessageSquare,
    Pin,
    Megaphone,
    Settings,
  } from 'lucide-svelte'
  import { Nav } from '@heedback/ui-kit'

  let { activePath, orgId }: { activePath: string; orgId: string } = $props()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  let navItems = $derived<Array<{ href: string; label: string; icon: IconComponent }>>([
    { href: `/${orgId}`, label: $_('nav.dashboard'), icon: LayoutDashboard },
    { href: `/${orgId}/articles`, label: $_('nav.articles'), icon: FileText },
    { href: `/${orgId}/inbox`, label: $_('nav.inbox'), icon: Inbox },
    { href: `/${orgId}/boards`, label: $_('nav.boards'), icon: MessageSquare },
    { href: `/${orgId}/posts`, label: $_('nav.posts'), icon: Pin },
    { href: `/${orgId}/changelog`, label: $_('nav.changelog'), icon: Megaphone },
    { href: `/${orgId}/settings`, label: $_('nav.settings'), icon: Settings },
  ])
</script>

<Nav items={navItems} {activePath} />
