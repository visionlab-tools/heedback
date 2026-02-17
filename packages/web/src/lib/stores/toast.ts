import { writable } from 'svelte/store'

export interface Toast {
  id: number
  message: string
  variant: 'error' | 'success'
}

let nextId = 0

const { subscribe, update } = writable<Toast[]>([])

export const toasts = { subscribe }

export function addToast(message: string, variant: Toast['variant'] = 'error') {
  const id = nextId++
  update((list) => [...list, { id, message, variant }])

  // Auto-dismiss after 5 seconds
  setTimeout(() => dismissToast(id), 5000)
}

export function dismissToast(id: number) {
  update((list) => list.filter((t) => t.id !== id))
}
