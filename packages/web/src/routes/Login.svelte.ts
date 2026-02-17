import { navigate } from 'svelte-routing'
import { auth } from '../lib/stores/auth'

export function createLoginState() {
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    error = ''
    loading = true

    try {
      await auth.login(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Login failed'
    } finally {
      loading = false
    }
  }

  return {
    get email() { return email },
    set email(v: string) { email = v },
    get password() { return password },
    set password(v: string) { password = v },
    get error() { return error },
    get loading() { return loading },
    handleSubmit,
  }
}
