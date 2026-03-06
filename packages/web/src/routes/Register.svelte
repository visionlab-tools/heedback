<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button, Input, Alert } from '@heedback/ui-kit'
  import { createRegisterState } from './Register.svelte.ts'

  const formState = createRegisterState()
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50">
  <div class="max-w-sm w-full p-8 bg-white rounded-lg shadow-sm border border-slate-200">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-slate-900">{$_('register.title')}</h1>
      <p class="mt-2 text-sm text-slate-500">{$_('register.subtitle')}</p>
    </div>

    {#if formState.error}
      <div class="mt-6">
        <Alert variant="error">{formState.error}</Alert>
      </div>
    {/if}

    <form onsubmit={formState.handleSubmit} class="mt-8 space-y-4">
      <Input
        label={$_('register.full_name')}
        id="fullName"
        type="text"
        bind:value={formState.fullName}
        required
      />

      <Input
        label={$_('register.email')}
        id="email"
        type="email"
        bind:value={formState.email}
        required
        placeholder="admin@example.com"
      />

      <Input
        label={$_('register.password')}
        id="password"
        type="password"
        bind:value={formState.password}
        required
      />

      <Button type="submit" disabled={formState.loading} size="md" fullWidth>
        {formState.loading ? $_('register.loading') : $_('register.submit')}
      </Button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      {$_('register.has_account')}
      <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
        {$_('register.sign_in')}
      </a>
    </p>
  </div>
</div>
