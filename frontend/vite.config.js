import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Docker deployment uses root path
  build: {
    outDir: 'dist', // Standard dist folder for Docker
    emptyOutDir: true,
  },
  server: {
    port: 5173
  }
})

