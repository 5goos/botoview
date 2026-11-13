// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import alpinejs from '@astrojs/alpinejs';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://botoview.5goos.com',
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
  integrations: [
    alpinejs(),
    partytown({
      config: { forward: ['dataLayer.push'] }
    })
  ]
});