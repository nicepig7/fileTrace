import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@assets': path.resolve(import.meta.dirname, './src/assets'),
      '@base': path.resolve(import.meta.dirname, './src/base'),
      '@common': path.resolve(import.meta.dirname, './src/common'),
      '@domain': path.resolve(import.meta.dirname, './src/domain'),
      '@extern': path.resolve(import.meta.dirname, './src/extern')
    }
  },
  build: {
    outDir: 'report',
    emptyOutDir: false,
  }
})
