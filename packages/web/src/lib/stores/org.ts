import { writable } from 'svelte/store'
import { api } from '../api/client'

interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  settings: Record<string, unknown>
}

function createOrgStore() {
  const { subscribe, set } = writable<Organization | null>(null)

  return {
    subscribe,

    async load() {
      const data = await api.get<{ data: Organization[] }>('/organizations')
      const org = data.data[0] || null
      set(org)
      return org
    },

    select(org: Organization) {
      set(org)
    },

    clear() {
      set(null)
    },
  }
}

export const currentOrg = createOrgStore()
