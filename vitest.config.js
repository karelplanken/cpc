import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      include: ['docs/js/**/*.js'],
      // main.js only wires things together in a real browser; the end-to-end tests cover it.
      exclude: ['docs/js/main.js'],
      reporter: ['text', 'html'],
    },
  },
});
