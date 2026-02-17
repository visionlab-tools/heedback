<script lang="ts">
  import AppRouter from './lib/components/Router.svelte'
  import type { RouteDefinition } from './lib/components/Router.svelte'
  import Layout from './lib/components/Layout.svelte'
  import Login from './routes/Login.svelte'
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
  import NotFound from './routes/NotFound.svelte'

  /* Routes are matched top-to-bottom; first match wins.
     More specific paths (e.g. /articles/new) must come before parameterized ones. */
  const routes: RouteDefinition[] = [
    { path: '/login', component: Login },
    { path: '/', component: Dashboard, layout: Layout },
    { path: '/articles', component: Articles, layout: Layout },
    { path: '/articles/new', component: ArticleEditor, layout: Layout },
    { path: '/articles/:id/edit', component: ArticleEditor, layout: Layout },
    { path: '/collections', component: Collections, layout: Layout },
    { path: '/inbox', component: Inbox, layout: Layout },
    { path: '/inbox/:id', component: ConversationDetail, layout: Layout },
    { path: '/boards', component: Boards, layout: Layout },
    { path: '/posts', component: Posts, layout: Layout },
    { path: '/posts/:id', component: PostDetail, layout: Layout },
    { path: '/changelog', component: Changelog, layout: Layout },
    { path: '/changelog/new', component: ChangelogEditor, layout: Layout },
    { path: '/changelog/:id/edit', component: ChangelogEditor, layout: Layout },
    { path: '/settings', component: Settings, layout: Layout },
    { path: '/settings/widget', component: SettingsWidget, layout: Layout },
    { path: '*', component: NotFound, layout: Layout },
  ]
</script>

<AppRouter {routes} />
