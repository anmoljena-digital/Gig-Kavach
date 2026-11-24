import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves the site from /Gig-Kavach/; dev server stays at /.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/Gig-Kavach/' : '/',
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5173 },
}));
