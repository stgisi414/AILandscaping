
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['3271aa25-8d54-41ec-a976-e5a515e3ea35-00-32bun4fkjo0hf.janeway.replit.dev', 'ailandscaping.biz']
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
})
