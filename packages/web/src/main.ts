import { mount } from 'svelte'
import App from './App.svelte'
import { initI18n } from './lib/i18n/index.ts'
import './app.css'

// Load i18n before mount to avoid flash of untranslated content
await initI18n()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
