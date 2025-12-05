// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mcp from 'astro-mcp';

// https://astro.build/config
export default defineConfig({
  site: 'https://fullfran.github.io',
  base: '/links',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mcp()]
});