import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import { processCLIArgs, configure, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))
configure({
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
  plugins: [assert(), apiClient({ baseURL: `http://localhost:${process.env.PORT || 3333}` })],
})

run()
