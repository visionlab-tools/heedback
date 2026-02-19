import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

/**
 * Injects the extracted CSS into the IIFE entry chunk as a <style> tag.
 * An embeddable widget is loaded via a single <script> — there's no separate
 * <link> tag, so the CSS must travel inside the JS bundle.
 *
 * Uses writeBundle (post-write) because Vite 6 emits the CSS file outside
 * the Rollup asset pipeline, making it invisible to generateBundle.
 */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    enforce: 'post',
    writeBundle(options) {
      const outDir = options.dir ?? 'dist'
      const cssPath = path.resolve(outDir, 'widget.css')
      const jsPath = path.resolve(outDir, 'widget.iife.js')

      if (!fs.existsSync(cssPath) || !fs.existsSync(jsPath)) return

      const css = fs.readFileSync(cssPath, 'utf-8')
      const js = fs.readFileSync(jsPath, 'utf-8')
      const inject = `(function(){var s=document.createElement("style");s.textContent=${JSON.stringify(css)};document.head.appendChild(s)})();\n`

      fs.writeFileSync(jsPath, inject + js)
      fs.unlinkSync(cssPath)
    },
  }
}

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: false,
      },
    }),
    inlineCss(),
  ],
  resolve: {
    // Ensures Svelte's client-side exports (mount, unmount) are resolved
    // instead of SSR server stubs that throw at runtime
    conditions: ['browser'],
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'Heedback',
      fileName: 'widget',
      formats: ['iife'],
    },
    outDir: 'dist',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
