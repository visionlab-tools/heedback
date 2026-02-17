import { writable } from 'svelte/store'
import { api } from '../api/client'

interface AdminUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  isSuperAdmin: boolean
}

interface AuthState {
  user: AdminUser | null
  loading: boolean
  initialized: boolean
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  })

  return {
    subscribe,

    async init() {
      try {
        const data = await api.get<{ user: AdminUser }>('/auth/me')
        set({ user: data.user, loading: false, initialized: true })
      } catch {
        set({ user: null, loading: false, initialized: true })
      }
    },

    async login(email: string, password: string) {
      const data = await api.post<{ user: AdminUser }>('/auth/login', { email, password })
      update((state) => ({ ...state, user: data.user }))
      return data.user
    },

    async logout() {
      await api.post('/auth/logout')
      set({ user: null, loading: false, initialized: true })
    },
  }
}

export const auth = createAuthStore()
