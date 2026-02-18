import { writable } from 'svelte/store'
import { api } from '../api/client'

export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  settings: Record<string, unknown>
}

// Separate stores to avoid breaking existing subscribers
export const allOrgs = writable<Organization[]>([])
export const orgLoading = writable(true)

function createOrgStore() {
  const { subscribe, set } = writable<Organization | null>(null)

  return {
    subscribe,

    async load() {
      orgLoading.set(true)
      try {
        const data = await api.get<{ data: Organization[] }>('/organizations')
        allOrgs.set(data.data)
        const org = data.data[0] || null
        set(org)
        return org
      } finally {
        orgLoading.set(false)
      }
    },

    select(org: Organization) {
      set(org)
    },

    clear() {
      set(null)
      allOrgs.set([])
    },
  }
}

export const currentOrg = createOrgStore()
