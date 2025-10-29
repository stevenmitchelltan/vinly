import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/', // Use env var or default to '/'
  build: {
    outDir: '../docs', // Build to docs folder for GitHub Pages
    emptyOutDir: false, // Don't empty docs (keep documentation and images)
  },
  server: {
    port: 5173
  }
})

