// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://arananet.net',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Emit CSS and JS as files so the Content-Security-Policy can stay 'self' only.
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  devToolbar: { enabled: false },
});
