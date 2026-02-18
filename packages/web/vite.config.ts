import path from 'node:path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    conditions: ['browser'],
    // Resolve TipTap from web's node_modules when compiling ui-kit .svelte files
    dedupe: ['@tiptap/core', '@tiptap/pm', '@tiptap/starter-kit', 'tiptap-markdown'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    fs: {
      /* Allow Vite to serve both the web package and the sibling ui-kit */
      allow: [__dirname, path.resolve(__dirname, '../ui-kit')],
    },
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
})
