import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  /*
  |--------------------------------------------------------------------------
  | App environment
  |--------------------------------------------------------------------------
  */
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  APP_KEY: Env.schema.string(),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_SSL: Env.schema.boolean.optional(),
  DB_DEBUG: Env.schema.boolean.optional(),

  /*
  |--------------------------------------------------------------------------
  | Redis
  |--------------------------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Session
  |--------------------------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Super admin seed
  |--------------------------------------------------------------------------
  */
  SUPER_ADMIN_EMAIL: Env.schema.string.optional(),
  SUPER_ADMIN_PASSWORD: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Kuriyr (email service)
  |--------------------------------------------------------------------------
  */
  KURIYR_API_URL: Env.schema.string.optional(),
  KURIYR_API_KEY: Env.schema.string.optional(),
  KURIYR_FROM_EMAIL: Env.schema.string.optional(),
  KURIYR_FROM_NAME: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Frontend URLs
  |--------------------------------------------------------------------------
  */
  FRONTEND_URL: Env.schema.string.optional(),
  PUBLIC_SITE_URL: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | S3 storage (MinIO in dev)
  |--------------------------------------------------------------------------
  */
  S3_ENDPOINT: Env.schema.string.optional(),
  S3_BUCKET: Env.schema.string.optional(),
  S3_ACCESS_KEY: Env.schema.string.optional(),
  S3_SECRET_KEY: Env.schema.string.optional(),
  S3_REGION: Env.schema.string.optional(),
})
