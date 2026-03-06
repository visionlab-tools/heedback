import { navigate } from '../lib/router.svelte.ts'
import { auth } from '../lib/stores/auth'

export function createRegisterState() {
  let fullName = $state('')
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    error = ''
    loading = true

    try {
      await auth.register(fullName, email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Registration failed'
    } finally {
      loading = false
    }
  }

  return {
    get fullName() { return fullName },
    set fullName(v: string) { fullName = v },
    get email() { return email },
    set email(v: string) { email = v },
    get password() { return password },
    set password(v: string) { password = v },
    get error() { return error },
    get loading() { return loading },
    handleSubmit,
  }
}
