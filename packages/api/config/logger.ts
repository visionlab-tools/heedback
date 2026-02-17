import env from '#start/env'
import { defineConfig } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      name: 'heedback',
      level: env.get('LOG_LEVEL', 'info'),
    },
  },
})

export default loggerConfig
