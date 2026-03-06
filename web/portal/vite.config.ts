/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  server: {
    proxy: {
      '/api/monitoring': { target: 'http://localhost:4010', rewrite: (path) => path.replace(/^\/api\/monitoring/, '') },
      '/api/decisioning': { target: 'http://localhost:4011', rewrite: (path) => path.replace(/^\/api\/decisioning/, '') },
      '/api/audit': { target: 'http://localhost:4013', rewrite: (path) => path.replace(/^\/api\/audit/, '') },
      '/api/ai': { target: 'http://localhost:4014', rewrite: (path) => path.replace(/^\/api\/ai/, '') },
      '/api/appetite': { target: 'http://localhost:4012', rewrite: (path) => path.replace(/^\/api\/appetite/, '') },
    },
  },
})

