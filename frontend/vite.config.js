import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vinly/', // GitHub Pages base path
  build: {
    outDir: '../docs',
    emptyOutDir: false, // Keep existing files like images
  },
  server: {
    port: 5173
  }
})

