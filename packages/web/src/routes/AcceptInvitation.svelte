<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Button, Alert } from '@heedback/ui-kit'
  import { api } from '../lib/api/client'
  import { navigate } from '../lib/router.svelte.ts'
  import { auth } from '../lib/stores/auth'

  let isAuthenticated = $state(false)
  let loading = $state(true)
  let accepting = $state(false)
  let error = $state('')

  const token = new URLSearchParams(window.location.search).get('token')

  auth.subscribe((authState) => {
    if (!authState.initialized) return
    isAuthenticated = !!authState.user
    loading = false

    // Auto-accept when authenticated
    if (authState.user && token && !accepting) {
      acceptInvitation()
    }
  })

  async function acceptInvitation() {
    if (!token || accepting) return
    accepting = true
    error = ''

    try {
      const res = await api.post<{ data: { organizationId: string } }>(
        '/invitations/accept',
        { token },
      )
      navigate(`/${res.data.organizationId}`, { replace: true })
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : $_('accept_invitation.error')
      accepting = false
    }
  }

  function redirectToLogin() {
    const redirect = encodeURIComponent(`/invitations/accept?token=${token}`)
    navigate(`/login?redirect=${redirect}`)
  }

  function redirectToRegister() {
    const redirect = encodeURIComponent(`/invitations/accept?token=${token}`)
    navigate(`/register?redirect=${redirect}`)
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50">
  <div class="max-w-sm w-full p-8 bg-white rounded-lg shadow-sm border border-slate-200">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-slate-900">{$_('accept_invitation.title')}</h1>
      <p class="mt-2 text-sm text-slate-500">{$_('accept_invitation.subtitle')}</p>
    </div>

    {#if !token}
      <div class="mt-6">
        <Alert variant="error">{$_('accept_invitation.no_token')}</Alert>
      </div>
    {:else if error}
      <div class="mt-6">
        <Alert variant="error">{error}</Alert>
      </div>
    {:else if loading || accepting}
      <p class="mt-6 text-center text-sm text-slate-500">
        {$_('accept_invitation.accepting')}
      </p>
    {:else if !isAuthenticated}
      <div class="mt-8 space-y-3">
        <Button onclick={redirectToLogin} fullWidth>
          {$_('accept_invitation.sign_in')}
        </Button>
        <Button onclick={redirectToRegister} fullWidth variant="secondary">
          {$_('accept_invitation.sign_up')}
        </Button>
      </div>
    {/if}
  </div>
</div>
