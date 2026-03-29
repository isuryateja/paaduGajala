import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [projectRoot]
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/tests/**/*.test.ts']
  }
});
