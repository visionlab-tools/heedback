<script lang="ts">
  import { Router, Route } from 'svelte-routing'
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
  import Settings from './routes/Settings.svelte'
  import NotFound from './routes/NotFound.svelte'
</script>

<Router>
  <Route path="/login" component={Login} />
  <Layout>
    <Route path="/" component={Dashboard} />
    <Route path="/articles" component={Articles} />
    <Route path="/articles/new" component={ArticleEditor} />
    <Route path="/articles/:id/edit" component={ArticleEditor} />
    <Route path="/collections" component={Collections} />
    <Route path="/boards" component={Boards} />
    <Route path="/posts" component={Posts} />
    <Route path="/posts/:id" component={PostDetail} />
    <Route path="/changelog" component={Changelog} />
    <Route path="/changelog/new" component={ChangelogEditor} />
    <Route path="/changelog/:id/edit" component={ChangelogEditor} />
    <Route path="/settings" component={Settings} />
    <Route component={NotFound} />
  </Layout>
</Router>
