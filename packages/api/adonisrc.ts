import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
  ],

  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@adonisjs/session/session_provider'),
    () => import('@adonisjs/redis/redis_provider'),
    () => import('#providers/app_provider'),
  ],

  preloads: [
    () => import('#start/kernel'),
    () => import('#start/routes'),
  ],

  tests: {
    suites: [
      {
        name: 'functional',
        files: ['tests/functional/**/*.spec.ts'],
        timeout: 30_000,
      },
      {
        name: 'unit',
        files: ['tests/unit/**/*.spec.ts'],
        timeout: 10_000,
      },
    ],
  },

  directories: {
    config: 'config',
    public: 'public',
    contracts: 'contracts',
    providers: 'providers',
    languageFiles: 'resources/lang',
    migrations: 'database/migrations',
    seeders: 'database/seeders',
    factories: 'database/factories',
    views: 'resources/views',
    start: 'start',
    tmp: 'tmp',
    tests: 'tests',
    httpControllers: 'app/controllers',
    models: 'app/models',
    services: 'app/services',
    exceptions: 'app/exceptions',
    middleware: 'app/middleware',
    validators: 'app/validators',
  },

  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
  ],
})
