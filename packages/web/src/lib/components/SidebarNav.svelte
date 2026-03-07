<script lang="ts">
  import { onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import {
    LayoutDashboard,
    FileText,
    Inbox,
    Users,
    MessageSquare,
    Pin,
    Megaphone,
    Settings,
  } from 'lucide-svelte'
  import { Nav } from '@heedback/ui-kit'
  import { inboxUnread } from '../stores/inbox'

  let { activePath, orgId }: { activePath: string; orgId: string } = $props()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IconComponent = new (...args: any[]) => any

  let unreadCount = $state(0)
  const unsubUnread = inboxUnread.subscribe((v) => (unreadCount = v))
  onDestroy(() => unsubUnread())

  let navItems = $derived<Array<{ href: string; label: string; icon: IconComponent; badge?: number }>>([
    { href: `/${orgId}`, label: $_('nav.dashboard'), icon: LayoutDashboard },
    { href: `/${orgId}/articles`, label: $_('nav.articles'), icon: FileText },
    { href: `/${orgId}/inbox`, label: $_('nav.inbox'), icon: Inbox, badge: unreadCount },
    { href: `/${orgId}/contacts`, label: $_('nav.contacts'), icon: Users },
    { href: `/${orgId}/boards`, label: $_('nav.boards'), icon: MessageSquare },
    { href: `/${orgId}/posts`, label: $_('nav.posts'), icon: Pin },
    { href: `/${orgId}/changelog`, label: $_('nav.changelog'), icon: Megaphone },
    { href: `/${orgId}/settings`, label: $_('nav.settings'), icon: Settings },
  ])
</script>

<Nav items={navItems} {activePath} />
