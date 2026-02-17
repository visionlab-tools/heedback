<script lang="ts">
  import { Button, Input, Alert } from '@heedback/ui-kit'
  import { createLoginState } from './Login.svelte.ts'

  const state = createLoginState()
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-indigo-600">Heedback</h1>
      <p class="mt-2 text-sm text-gray-600">Sign in to your admin dashboard</p>
    </div>

    {#if state.error}
      <Alert variant="error">{state.error}</Alert>
    {/if}

    <form onsubmit={state.handleSubmit} class="space-y-6">
      <Input
        label="Email"
        id="email"
        type="email"
        bind:value={state.email}
        required
        placeholder="admin@example.com"
      />

      <Input
        label="Password"
        id="password"
        type="password"
        bind:value={state.password}
        required
      />

      <Button type="submit" disabled={state.loading} size="md">
        {state.loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  </div>
</div>
