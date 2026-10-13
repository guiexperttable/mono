// Smoke tests of the Solid wrapper in a real browser (Vitest 5 browser mode, headless Chromium via Playwright).
//
//   pnpm --filter @guiexpert/solid-table test          (all wrappers: pnpm test:wrappers)
//   once: pnpm --filter @guiexpert/solid-table exec playwright install chromium   (or set CHROMIUM_PATH)
//
// Like packages/table/vitest.config.ts deliberately independent of vite.config.ts (no dts/static-copy plugins).
// `@guiexpert/table` is resolved to the core SOURCE (packages/table/src/index.ts): no core build needed, and the
// wrapper, the specs and packages/table/test-utils share one instance of the core.
// Specs: src/**/*.browser.spec.tsx (next to the code, not part of the npm package).
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import solid from 'vite-plugin-solid';
import { fileURLToPath } from 'node:url';

// Optional: use a preinstalled Chromium instead of Playwright's own download (e.g. in a container).
const chromiumPath = process.env['CHROMIUM_PATH'];

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: { '@guiexpert/table': fileURLToPath(new URL('../table/src/index.ts', import.meta.url)) },
  },
  optimizeDeps: {
    // pre-bundle up front – otherwise Vite discovers them during the run and reloads the browser
    include: ['solid-js', 'solid-js/web'],
  },
  test: {
    name: 'solid-table',
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
