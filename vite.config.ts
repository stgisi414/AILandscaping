
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
        'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        host: true,
        port: 5173,
        allowedHosts: ['3271aa25-8d54-41ec-a976-e5a515e3ea35-00-32bun4fkjo0hf.janeway.replit.dev', 'ailandscaping.biz', 'ai-landscaping.replit.app']
      },
      preview: {
        host: '0.0.0.0',
        port: 5173
      }
    };
});
