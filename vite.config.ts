import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Usa a chave do ambiente ou a chave fornecida diretamente
    const apiKey = env.GEMINI_API_KEY || 'AIzaSyA6OCv5X0ps7Shu_0OKYrqs2o4P1YiD3ME';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve('./'),
        }
      }
    };
});