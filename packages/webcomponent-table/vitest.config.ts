// Smoke tests of the Web Component wrapper in a real browser (Vitest 5 browser mode, headless Chromium via Playwright).
//
//   pnpm --filter @guiexpert/webcomponent-table test          (all wrappers: pnpm test:wrappers)
//   once: pnpm --filter @guiexpert/webcomponent-table exec playwright install chromium   (or set CHROMIUM_PATH)
//
// Like packages/table/vitest.config.ts deliberately independent of vite.config.ts (no dts/static-copy plugins).
// `@guiexpert/table` is resolved to the core SOURCE (packages/table/src/index.ts): no core build needed, and the
// wrapper, the specs and packages/table/test-utils share one instance of the core.
// Specs: src/**/*.browser.spec.ts (next to the code, not part of the npm package).
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

// Optional: use a preinstalled Chromium instead of Playwright's own download (e.g. in a container).
const chromiumPath = process.env['CHROMIUM_PATH'];

export default defineConfig({
  resolve: {
    alias: { '@guiexpert/table': fileURLToPath(new URL('../table/src/index.ts', import.meta.url)) },
  },
  test: {
    name: 'webcomponent-table',
    include: ['src/**/*.browser.spec.{ts,tsx}'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1200, height: 900 },
    },
  },
});
