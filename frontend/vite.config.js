import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vinly/', // GitHub Pages base path
  build: {
    outDir: '../docs', // Build to docs folder for GitHub Pages
    emptyOutDir: false, // Don't empty docs (keep documentation and images)
  },
  server: {
    port: 5173
  }
})

