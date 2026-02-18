import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const HealthController = () => import('#controllers/health_controller')
const AuthController = () => import('#controllers/auth_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const CollectionsController = () => import('#controllers/collections_controller')
const ArticlesController = () => import('#controllers/articles_controller')
const BoardsController = () => import('#controllers/boards_controller')
const PostsController = () => import('#controllers/posts_controller')
const CommentsController = () => import('#controllers/comments_controller')
const TagsController = () => import('#controllers/tags_controller')
const RoadmapController = () => import('#controllers/roadmap_controller')
const ChangelogController = () => import('#controllers/changelog_controller')
const ConversationsController = () => import('#controllers/conversations_controller')
const UploadsController = () => import('#controllers/uploads_controller')

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/
router.get('/health', [HealthController, 'check'])

/*
|--------------------------------------------------------------------------
| Auth routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.post('/auth/login', [AuthController, 'login'])
    router.post('/auth/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/auth/me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/api/v1')

/*
|--------------------------------------------------------------------------
| Organization management (requires auth)
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    // File uploads — before org routes (no org middleware needed)
    router.post('/uploads', [UploadsController, 'store'])

    router.get('/organizations', [OrganizationsController, 'index'])
    router.post('/organizations', [OrganizationsController, 'store'])
    router.get('/organizations/:orgSlug', [OrganizationsController, 'show']).use(middleware.org())
    router.put('/organizations/:orgSlug', [OrganizationsController, 'update']).use(middleware.org())
    router
      .delete('/organizations/:orgSlug', [OrganizationsController, 'destroy'])
      .use(middleware.org())
      .use(middleware.orgRole({ roles: ['owner'] }))

    /*
    |--------------------------------------------------------------------------
    | Org members
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/members', [OrganizationsController, 'listMembers'])
        router.post('/members', [OrganizationsController, 'addMember'])
        router.put('/members/:memberId', [OrganizationsController, 'updateMember'])
        router.delete('/members/:memberId', [OrganizationsController, 'removeMember'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Knowledge base: collections
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/collections', [CollectionsController, 'index'])
        router.post('/collections', [CollectionsController, 'store'])
        router.get('/collections/:collectionId', [CollectionsController, 'show'])
        router.put('/collections/:collectionId', [CollectionsController, 'update'])
        router.delete('/collections/:collectionId', [CollectionsController, 'destroy'])
        router.post('/collections/reorder', [CollectionsController, 'reorder'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Knowledge base: articles
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/articles', [ArticlesController, 'index'])
        router.post('/articles', [ArticlesController, 'store'])
        router.get('/articles/search', [ArticlesController, 'search'])
        router.get('/articles/:articleId', [ArticlesController, 'show'])
        router.put('/articles/:articleId', [ArticlesController, 'update'])
        router.delete('/articles/:articleId', [ArticlesController, 'destroy'])
        router.post('/articles/:articleId/feedback', [ArticlesController, 'feedback'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Feedback: boards
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/boards', [BoardsController, 'index'])
        router.post('/boards', [BoardsController, 'store'])
        router.get('/boards/:boardId', [BoardsController, 'show'])
        router.put('/boards/:boardId', [BoardsController, 'update'])
        router.delete('/boards/:boardId', [BoardsController, 'destroy'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Feedback: posts
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/posts', [PostsController, 'index'])
        router.post('/posts', [PostsController, 'store'])
        router.get('/posts/:postId', [PostsController, 'show'])
        router.put('/posts/:postId', [PostsController, 'update'])
        router.delete('/posts/:postId', [PostsController, 'destroy'])
        router.post('/posts/:postId/vote', [PostsController, 'vote'])
        router.delete('/posts/:postId/vote', [PostsController, 'unvote'])
        router.post('/posts/:postId/merge', [PostsController, 'merge'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Feedback: comments
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/posts/:postId/comments', [CommentsController, 'index'])
        router.post('/posts/:postId/comments', [CommentsController, 'store'])
        router.put('/comments/:commentId', [CommentsController, 'update'])
        router.delete('/comments/:commentId', [CommentsController, 'destroy'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Tags
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/tags', [TagsController, 'index'])
        router.post('/tags', [TagsController, 'store'])
        router.put('/tags/:tagId', [TagsController, 'update'])
        router.delete('/tags/:tagId', [TagsController, 'destroy'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Roadmap
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/roadmap', [RoadmapController, 'index'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Changelog
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/changelog', [ChangelogController, 'index'])
        router.post('/changelog', [ChangelogController, 'store'])
        router.get('/changelog/:entryId', [ChangelogController, 'show'])
        router.put('/changelog/:entryId', [ChangelogController, 'update'])
        router.delete('/changelog/:entryId', [ChangelogController, 'destroy'])
        router.post('/changelog/:entryId/publish', [ChangelogController, 'publish'])
        router.post('/changelog/subscribers', [ChangelogController, 'subscribe'])
        router.delete('/changelog/subscribers/:email', [ChangelogController, 'unsubscribe'])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())

    /*
    |--------------------------------------------------------------------------
    | Chat: conversations (inbox)
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/conversations', [ConversationsController, 'index'])
        router.get('/conversations/:conversationId', [ConversationsController, 'show'])
        router.put('/conversations/:conversationId', [ConversationsController, 'update'])
        router.delete('/conversations/:conversationId', [ConversationsController, 'destroy'])
        router.post('/conversations/:conversationId/messages', [
          ConversationsController,
          'sendMessage',
        ])
      })
      .prefix('/org/:orgSlug')
      .use(middleware.org())
  })
  .prefix('/api/v1')
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Public API routes (no auth required)
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    /*
    | Public org config (widget colors, name)
    */
    router.get('/org/:orgSlug/public/config', [OrganizationsController, 'publicConfig'])

    /*
    | Public knowledge base
    */
    router.get('/org/:orgSlug/public/collections', [CollectionsController, 'publicIndex'])
    router.get('/org/:orgSlug/public/articles/:articleId', [ArticlesController, 'publicShow'])
    router.get('/org/:orgSlug/public/articles/search', [ArticlesController, 'publicSearch'])
    router.post('/org/:orgSlug/public/articles/:articleId/feedback', [ArticlesController, 'feedback'])

    /*
    | Public roadmap
    */
    router.get('/org/:orgSlug/public/roadmap', [RoadmapController, 'index'])

    /*
    | Public changelog
    */
    router.get('/org/:orgSlug/public/changelog', [ChangelogController, 'publicIndex'])
    router.get('/org/:orgSlug/public/changelog/:entryId', [ChangelogController, 'publicShow'])
    router.post('/org/:orgSlug/public/changelog/subscribers', [ChangelogController, 'subscribe'])
    router
      .delete('/org/:orgSlug/public/changelog/subscribers/:email', [
        ChangelogController,
        'unsubscribe',
      ])

    /*
    | Public chat / conversations
    */
    router.post('/org/:orgSlug/public/conversations', [ConversationsController, 'publicStore'])
    router.get('/org/:orgSlug/public/conversations/:conversationId', [
      ConversationsController,
      'publicShow',
    ])
    router.post('/org/:orgSlug/public/conversations/:conversationId/messages', [
      ConversationsController,
      'publicReply',
    ])
  })
  .prefix('/api/v1')
