import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * Global middleware executed on every HTTP request
 */
server.use([
  () => import('@adonisjs/cors/cors_middleware'),
  () => import('@adonisjs/static/static_middleware'),
  () => import('#middleware/container_bindings_middleware'),
])

/**
 * Named middleware that can be assigned to routes or route groups
 */
router.use([
  () => import('@adonisjs/session/session_middleware'),
])

/**
 * Named middleware collection. These are referenced by name
 * when assigning middleware to routes.
 */
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  org: () => import('#middleware/org_middleware'),
  orgRole: () => import('#middleware/org_role_middleware'),
})
