import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/server.js'],
      reporter: ['text', 'lcov'],
      // Coverage mínimo declarado (README): 70%. Se cair, o teste falha.
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
    },
  },
});
