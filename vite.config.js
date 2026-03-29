import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // 🔥 base должен быть ТОЧНО таким:
  base: '/zhidao-react/',
  
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
    // 🔥 Добавь это:
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})