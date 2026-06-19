import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const GITHUB_PAGES_BASE = '/DaVinciCode_Coda/';
const base = process.env.GITHUB_PAGES === 'true' ? GITHUB_PAGES_BASE : '/';
const appVersion = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../VERSION'),
  'utf8',
).trim();

export default defineConfig({
  base,
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
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
