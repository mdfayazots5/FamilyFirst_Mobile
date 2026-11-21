import path from 'path';
import { defineConfig } from 'vitest/config';

// P13B: unit / shape-parity tests. Separate from vite.config.ts so the PWA build plugins never run under test.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
