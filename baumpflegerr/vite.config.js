import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['baum.madmoench.de'],
    cors: {
      origin: ['baum.madmoench.de']
    },
    proxy: {
      '/api': {
        target: 'http://192.168.178.72:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})