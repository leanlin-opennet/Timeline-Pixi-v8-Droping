import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/Timeline-Pixi-v8-Droping/',
  server: {
    port: 8080,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  assetsInclude: ['**/*.atlas'],
  build: {
    assetsInlineLimit: 0,
  }
});
