import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}) 