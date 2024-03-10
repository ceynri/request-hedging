/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { version } from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: new URL('./src/index.ts', import.meta.url).pathname,
      name: 'request-hedging',
      formats: ['es', 'cjs'],
    },
    target: 'es6',
  },
  resolve: {
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
  define: {
    'process.env.__VERSION__': JSON.stringify(version),
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
