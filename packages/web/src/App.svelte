<script lang="ts">
  import AppRouter from './lib/components/Router.svelte'
  import type { RouteDefinition } from './lib/components/Router.svelte'
  import Layout from './lib/components/Layout.svelte'
  import Login from './routes/Login.svelte'
  import RootRedirect from './routes/RootRedirect.svelte'
  import Dashboard from './routes/Dashboard.svelte'
  import Articles from './routes/Articles.svelte'
  import ArticleEditor from './routes/ArticleEditor.svelte'
  import Collections from './routes/Collections.svelte'
  import Boards from './routes/Boards.svelte'
  import Posts from './routes/Posts.svelte'
  import PostDetail from './routes/PostDetail.svelte'
  import Changelog from './routes/Changelog.svelte'
  import ChangelogEditor from './routes/ChangelogEditor.svelte'
  import Inbox from './routes/Inbox.svelte'
  import ConversationDetail from './routes/ConversationDetail.svelte'
  import Settings from './routes/Settings.svelte'
  import SettingsWidget from './routes/SettingsWidget.svelte'
  import SettingsWidgetDemo from './routes/SettingsWidgetDemo.svelte'
  import SettingsIntegrations from './routes/SettingsIntegrations.svelte'
  import NotFound from './routes/NotFound.svelte'

  /* Routes are matched top-to-bottom; first match wins.
     All org-scoped routes are prefixed with /:orgId so the URL
     always reflects the active organization context. */
  const routes: RouteDefinition[] = [
    { path: '/login', component: Login },
    { path: '/', component: RootRedirect },
    { path: '/:orgId', component: Dashboard, layout: Layout },
    { path: '/:orgId/articles', component: Articles, layout: Layout },
    { path: '/:orgId/articles/new', component: ArticleEditor, layout: Layout },
    { path: '/:orgId/articles/:id/edit', component: ArticleEditor, layout: Layout },
    { path: '/:orgId/collections', component: Collections, layout: Layout },
    { path: '/:orgId/inbox', component: Inbox, layout: Layout },
    { path: '/:orgId/inbox/:id', component: ConversationDetail, layout: Layout },
    { path: '/:orgId/boards', component: Boards, layout: Layout },
    { path: '/:orgId/posts', component: Posts, layout: Layout },
    { path: '/:orgId/posts/:id', component: PostDetail, layout: Layout },
    { path: '/:orgId/changelog', component: Changelog, layout: Layout },
    { path: '/:orgId/changelog/new', component: ChangelogEditor, layout: Layout },
    { path: '/:orgId/changelog/:id/edit', component: ChangelogEditor, layout: Layout },
    { path: '/:orgId/settings', component: Settings, layout: Layout },
    { path: '/:orgId/settings/widget/demo', component: SettingsWidgetDemo, layout: Layout },
    { path: '/:orgId/settings/widget', component: SettingsWidget, layout: Layout },
    { path: '/:orgId/settings/integrations', component: SettingsIntegrations, layout: Layout },
    { path: '*', component: NotFound, layout: Layout },
  ]
</script>

<AppRouter {routes} />
