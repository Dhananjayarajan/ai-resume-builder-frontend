import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
      }, "/api" : {
        target : 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
