// Test configuration for @guiexpert/table (Vitest 5).
//
//   pnpm --filter @guiexpert/table test           unit + browser
//   pnpm --filter @guiexpert/table test:unit      Node only (fast, no browser needed)
//   pnpm --filter @guiexpert/table test:browser   real Chromium via Playwright (once: `pnpm exec playwright install chromium`)
//
// Deliberately independent of vite.config.ts: the library build plugins (babel, dts, static-copy) are not needed
// for tests and would only slow them down (and drag in the Babel pin, see CLAUDE.md §2).
//
// File conventions (next to the code):
//   *.spec.ts          → project "unit", runs in Node (most of the core is DOM-free)
//   *.browser.spec.ts  → project "browser", runs in headless Chromium (layout, scrolling, events)
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

// Optional: use a preinstalled Chromium instead of Playwright's own download (e.g. in a container).
const chromiumPath = process.env['CHROMIUM_PATH'];

export default defineConfig({
  resolve: {
    // Tests import like users do: `from '@guiexpert/table'` → src/index.ts.
    // A class that is missing from index.ts therefore fails the test immediately.
    alias: { '@guiexpert/table': fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.spec.ts'],
          exclude: ['src/**/*.browser.spec.ts'],
          // Spec files share one module instance per worker: ~1.5 s instead of ~18 s, because src/index.ts is
          // imported once instead of once per file. Tests therefore must not leave state behind – fresh objects per
          // test, reset singletons in beforeEach (see license-manager.spec.ts). The setup file restores timers and
          // stubbed globals after every test. Order independence is checked with `--sequence.shuffle`.
          isolate: false,
          setupFiles: ['test-utils/unit-setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.spec.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1200, height: 900 },
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.demo.ts', 'src/index.ts', 'src/**/*.if.ts'],
      reporter: ['text-summary', 'html'],
    },
  },
});
