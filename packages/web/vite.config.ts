import path from 'node:path'
import fs from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

/** Serve the widget IIFE bundle at /widget.js in dev so the demo page can load it */
function serveWidget(): Plugin {
  const widgetPath = path.resolve(__dirname, '../widget/dist/widget.iife.js')

  return {
    name: 'serve-widget',
    configureServer(server) {
      server.middlewares.use('/widget.js', (_req, res) => {
        if (!fs.existsSync(widgetPath)) {
          res.statusCode = 404
          res.end('Widget not built. Run: cd packages/widget && pnpm build')
          return
        }
        res.setHeader('Content-Type', 'application/javascript')
        fs.createReadStream(widgetPath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [svelte(), tailwindcss(), serveWidget()],
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
