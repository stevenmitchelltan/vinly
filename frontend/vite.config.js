import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/vinly/' : '/',
  define: {
    // In production builds, use static wines.json instead of localhost API
    ...(isProduction && { 'import.meta.env.VITE_USE_STATIC_DATA': JSON.stringify('true') }),
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    port: 5173
  }
})

