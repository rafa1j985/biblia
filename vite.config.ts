import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
  define: {
    // Polyfill process.env to prevent crash if accessing it directly in client code
    'process.env': {} 
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});