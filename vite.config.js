import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true
        },
        '/ws': {
          target: API_URL,
          ws: true,
          changeOrigin: true
        },
        '/users': {
          target: API_URL,
          changeOrigin: true
        },
        '/messages': {
          target: API_URL,
          changeOrigin: true
        },
        '/contacts': {
          target: API_URL,
          changeOrigin: true
        }
      }
    }
  }
})
