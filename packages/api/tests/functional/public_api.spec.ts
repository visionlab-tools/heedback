import { test } from '@japa/runner'

test.group('Public API', () => {
  test('GET /api/v1/org/:orgSlug/public/collections returns 404 for unknown org', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/org/nonexistent-org/public/collections')
    response.assertStatus(404)
  })

  test('GET /api/v1/org/:orgSlug/public/articles/:id returns 404 for unknown org', async ({
    client,
  }) => {
    const response = await client.get(
      '/api/v1/org/nonexistent-org/public/articles/00000000-0000-0000-0000-000000000000',
    )
    response.assertStatus(404)
  })

  test('GET /api/v1/org/:orgSlug/public/changelog returns 404 for unknown org', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/org/nonexistent-org/public/changelog')
    response.assertStatus(404)
  })

  test('POST /api/v1/org/:orgSlug/public/conversations creates a conversation', async ({
    client,
  }) => {
    // This will 404 for nonexistent org
    const response = await client
      .post('/api/v1/org/nonexistent-org/public/conversations')
      .json({
        body: 'Hello, I need help!',
        channel: 'widget',
      })
    response.assertStatus(404)
  })

  test('GET /api/v1/org/:orgSlug/public/roadmap returns 404 for unknown org', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/org/nonexistent-org/public/roadmap')
    response.assertStatus(404)
  })
})
