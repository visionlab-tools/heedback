import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/session'

const sessionConfig = defineConfig({
  enabled: true,
  cookieName: 'heedback_session',
  clearWithBrowser: false,
  age: '2h',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: env.get('NODE_ENV') === 'production',
    sameSite: 'lax',
  },
  store: env.get('SESSION_DRIVER', 'cookie') as 'cookie' | 'memory',
  stores: {
    cookie: stores.cookie(),
  },
})

export default sessionConfig
