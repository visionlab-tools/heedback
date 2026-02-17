import { test } from '@japa/runner'

test.group('Auth', () => {
  test('POST /api/v1/auth/login returns 422 with missing credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({})
    response.assertStatus(422)
  })

  test('POST /api/v1/auth/login returns 400 with invalid credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    })
    response.assertStatus(400)
  })

  test('GET /api/v1/auth/me returns 401 when not authenticated', async ({ client }) => {
    const response = await client.get('/api/v1/auth/me')
    response.assertStatus(401)
  })
})
