import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5174',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        // Fix: __dirname is not available in ES modules. Use import.meta.url to get the current file's directory.
        '@': fileURLToPath(new URL('.', import.meta.url)),
      }
    }
  };
});