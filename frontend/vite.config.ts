import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path/posix'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4321,
    proxy: {
      '/api/v1': 'http://localhost:4322',
      '/api/v2': 'http://localhost:4324',
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
    },
  },
})
