import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@telegram-apps/bridge'],
    include: ['@aptos-labs/ts-sdk', 'aptos']
  },
  build: {
    rollupOptions: {
      external: ['@telegram-apps/bridge']
    },
    sourcemap: false
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  define: {
    global: 'globalThis'
  },
  esbuild: {
    sourcemap: false
  }
})
