// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
plugins: [react()],
server: {
proxy: {
'/chat': {
target: 'http://localhost:3000', // Backend server address
changeOrigin: true,
},
},
},
// Add test configuration
test: {
globals: true, // Make `describe`, `it`, `expect`, etc. available globally
environment: 'jsdom', // Use JSDOM as test environment
setupFiles: './src/setupTests.js', // Test setup file
css: false, // Do not process CSS imports in tests
testTimeout: 30000, // Extend global test timeout to 30 seconds
hookTimeout: 30000, // Extend the timeout for each hook (beforeEach, afterEach, etc.)
},
});