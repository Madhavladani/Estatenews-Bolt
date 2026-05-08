// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',

  site: 'https://propdiscover.com',

  integrations: [
    tailwind(),
    sitemap()
  ],

  adapter: node({
    mode: 'standalone',
  }),

  build: {
    format: 'directory',
  },

  server: {
    host: true
  },

  security: {
    checkOrigin: false
  }
});