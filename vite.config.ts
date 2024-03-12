/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { version } from './package.json';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'request-hedging',
      formats: ['es', 'cjs'],
    },
    target: 'es6',
  },
  resolve: {
    alias: {
      '@/': resolve(__dirname, './src/'),
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      enabled: true,
      include: ['src/**', '!src/index.ts', '!src/types.ts'],
      reportsDirectory: 'test/coverage',
    },
  },
});
