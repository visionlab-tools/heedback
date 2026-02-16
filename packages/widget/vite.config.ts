import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: false,
      },
    }),
  ],
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
