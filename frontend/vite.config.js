import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const proxy = { '/api': { target: process.env.API_URL || 'http://127.0.0.1:8000', changeOrigin: true, timeout: 200000, proxyTimeout: 195000 } };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy, watch: { usePolling: process.env.VITE_USE_POLLING === 'true', interval: 500 } },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true, proxy },
});
