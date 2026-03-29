import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/zhidao-react/',  // ← Вот здесь имя репозитория
  server: {
    proxy: {
      '/api': {
        target: 'https://hk.marucho.icu:8443',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})