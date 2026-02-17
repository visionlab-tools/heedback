<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button, Input, Alert } from '@heedback/ui-kit'
  import { createLoginState } from './Login.svelte.ts'

  const state = createLoginState()
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50">
  <div class="max-w-sm w-full p-8 bg-white rounded-lg shadow-sm border border-slate-200">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-slate-900">{$_('login.title')}</h1>
      <p class="mt-2 text-sm text-slate-500">{$_('login.subtitle')}</p>
    </div>

    {#if state.error}
      <div class="mt-6">
        <Alert variant="error">{state.error}</Alert>
      </div>
    {/if}

    <form onsubmit={state.handleSubmit} class="mt-8 space-y-4">
      <Input
        label={$_('login.email')}
        id="email"
        type="email"
        bind:value={state.email}
        required
        placeholder="admin@example.com"
      />

      <Input
        label={$_('login.password')}
        id="password"
        type="password"
        bind:value={state.password}
        required
      />

      <Button type="submit" disabled={state.loading} size="md" fullWidth>
        {state.loading ? $_('login.loading') : $_('login.submit')}
      </Button>
    </form>
  </div>
</div>
