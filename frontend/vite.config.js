import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
    svgrOptions: {
      exportType: 'named',
      ref: true,
    },
  })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  css: {
    postcss: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns')
    }
  },
  optimizeDeps: {
    include: ['date-fns', '@mui/x-date-pickers']
  }
})
