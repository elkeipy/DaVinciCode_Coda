import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const GITHUB_PAGES_BASE = '/DaVinciCode_Coda/';
const base = process.env.GITHUB_PAGES === 'true' ? GITHUB_PAGES_BASE : '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});
