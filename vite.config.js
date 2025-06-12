// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
     
      '/chat': {
        target: 'http://backend:3000', 
        changeOrigin: true,        
      },
    },
  },  
  test: {
    globals: true, 
    environment: 'jsdom', 
    setupFiles: './src/setupTests.js', 
    css: false,
    testTimeout: 30000, 
    hookTimeout: 30000, 
  },
});