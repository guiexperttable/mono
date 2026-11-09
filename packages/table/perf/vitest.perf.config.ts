// Performance checks of @guiexpert/table (prompt 021, stages 2 and 3) – outside src/: no coverage, never in the npm
// package, not part of `pnpm test`.
//
//   pnpm --filter @guiexpert/table test:perf        ratios small n vs. large n (fails) + trend vs. baseline (warns)
//   pnpm --filter @guiexpert/table perf:baseline    take perf/results/latest.json as the new baseline of this platform
//
// Stage 2: the SAME operation with a small and a large n – the speed of the machine cancels out, the complexity is
// checked (perf/measure.ts `expectScalesFlat`). Stage 3: the absolute times go to perf/results/latest.json and are
// compared with perf/baseline.json (perf/perf-reporter.ts): a warning, never red.
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { browserCommands } from '../test-utils/browser-commands';
import { PerfReporter } from './perf-reporter';

const chromiumPath = process.env['CHROMIUM_PATH'];

export default defineConfig({
  resolve: {
    alias: { '@guiexpert/table': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
  },
  test: {
    name: 'perf',
    root: fileURLToPath(new URL('..', import.meta.url)),
    include: ['perf/**/*.perf.ts'],
    fileParallelism: false, // one file at a time: no other test competes for the CPU
    testTimeout: 120_000,
    hookTimeout: 120_000,
    retry: 1, // a single disturbed run (GC, another process) may repeat once – a real regression fails twice
    reporters: ['default', new PerfReporter()],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1200, height: 900 },
      commands: browserCommands,
    },
  },
});
