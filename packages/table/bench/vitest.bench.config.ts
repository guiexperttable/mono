// Benchmarks of @guiexpert/table (outside src/: no coverage, never in the npm package, no time assertions in tests).
//
//   pnpm --filter @guiexpert/table bench
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@guiexpert/table': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['bench/**/*.bench.ts'],
    testTimeout: 120_000,
  },
});
