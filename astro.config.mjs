// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import alpinejs from '@astrojs/alpinejs';

const cloudflareRedirectRouting = {
  name: 'cloudflare-redirect-routing',
  hooks: {
    // @ts-ignore
    'astro:build:done': async ({ dir }) => {
      try {
        const serverWranglerPath = fileURLToPath(new URL('../server/wrangler.json', dir));
        const cfg = JSON.parse(await fs.readFile(serverWranglerPath, 'utf-8'));
        if (cfg?.assets) {
          cfg.assets.run_worker_first = [
            '/*.txt',
            '/index.html',
            '!/releases/',
            '!/releases/*/',
            '!/services/',
            '!/services/*/',
            '/releases',
            '/releases/*',
            '/services',
            '/services/*',
            '/404'
          ];
          await fs.writeFile(serverWranglerPath, JSON.stringify(cfg));
        }
      } catch {
      }
    }
  }
};

export default defineConfig({
  site: 'https://botoview.5goos.com',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
  integrations: [
    alpinejs(),
    cloudflareRedirectRouting
  ]
});
