// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',

  site: 'https://propdiscover.com',

  integrations: [
    tailwind(),
  ],

  adapter: node({
    mode: 'standalone',
  }),

  build: {
    format: 'directory',
  },

  vite: {
    // Avoid Windows EPERM issues writing to node_modules/.vite
    cacheDir: '.vite-cache',
    optimizeDeps: {
      // Reduce dependency pre-bundling churn on Windows.
      noDiscovery: true,
      include: [],
    },
  },

  server: {
    host: true
  },

  security: {
    checkOrigin: false
  }
});
