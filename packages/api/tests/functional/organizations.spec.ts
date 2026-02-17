import { test } from '@japa/runner'

test.group('Organizations', () => {
  test('GET /api/v1/organizations returns 401 when not authenticated', async ({ client }) => {
    const response = await client.get('/api/v1/organizations')
    response.assertStatus(401)
  })

  test('POST /api/v1/organizations returns 401 when not authenticated', async ({ client }) => {
    const response = await client.post('/api/v1/organizations').json({
      name: 'Test Org',
      slug: 'test-org',
    })
    response.assertStatus(401)
  })
})
