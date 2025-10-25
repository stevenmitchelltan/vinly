import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vinly/', // Change this to your repo name for GitHub Pages
  server: {
    port: 5173
  }
})

