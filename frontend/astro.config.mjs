// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';
// https://astro.build/config
// @ts-ignore
export default defineConfig({
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],

  },
  env: {
    schema: {
      PUBLIC_CLERK_PUBLISHABLE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      CLERK_SECRET_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      SIGNING_SECRET: envField.string({ context: 'server', access: 'public', optional: true }),
      PUBLIC_STRAPI_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_STRAPI_API_TOKEN: envField.string({ context: 'client', access: 'public', optional: true }),
      STRAPI_SERVER_TOKEN: envField.string({ context: 'server', access: 'public', optional: true }),
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'public', optional: true }),
      STRIPE_PUBLISHABLE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    }
  },
  integrations: [react(), clerk()]
});