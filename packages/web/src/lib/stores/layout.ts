import { writable } from 'svelte/store'

/** When true, Layout drops max-w and padding so the page fills the viewport */
export const fullWidth = writable(false)
