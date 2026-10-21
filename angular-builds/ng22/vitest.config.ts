// Tests of the Angular wrapper (Angular 22) – the first Angular tests of the mono repo (since 1.1.100, prompt 015).
//
//   pnpm --filter angular-build-ng22 test        (builds ng22 first; needs `pnpm build:core` once)
//   all wrappers: pnpm test:wrappers
//
// What is tested: the BUILT package (dist/, partially compiled by ng-packagr) – exactly what is published. The
// partial declarations are compiled at runtime by the JIT compiler (`import '@angular/compiler'` in test/setup-jit.ts);
// the test host components are JIT-compiled as well (they use no signal inputs, so no JIT transform is needed).
// `@guiexpert/table` is resolved to the core SOURCE like in the other wrapper tests (one core instance for wrapper,
// specs and packages/table/test-utils).
//
// Projects:
//   unit     test/**/*.node.spec.ts          Node – scripts/sync-angular-src.mjs (version marker @since-angular)
//   browser  test/**/*.browser.spec.ts     Chromium – TableSignalComponent, TableComponent
//
// When ng23 is created as a copy of ng22, move the test script and this config along (tests run in the newest major).
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

// Optional: use a preinstalled Chromium instead of Playwright's own download (e.g. in a container).
const chromiumPath = process.env['CHROMIUM_PATH'];

const alias = {
  '@guiexpert/table': fileURLToPath(new URL('../../packages/table/src/index.ts', import.meta.url)),
  '@guiexpert/angular-table': fileURLToPath(new URL('./dist/fesm2022/guiexpert-angular-table.mjs', import.meta.url)),
  'zone.js': fileURLToPath(new URL('./node_modules/zone.js-for-tests/fesm2015/zone.js', import.meta.url)),
};

export default defineConfig({
  resolve: { alias },
  // the test host components use decorators (JIT)
  esbuild: { tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } } },
  optimizeDeps: {
    // pre-bundle up front – otherwise Vite discovers them during the run and reloads the browser
    include: ['@angular/core', '@angular/common', '@angular/compiler', '@angular/platform-browser', 'zone.js'],
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'angular-ng22-unit', include: ['test/**/*.node.spec.ts'], environment: 'node' },
      },
      {
        extends: true,
        test: {
          name: 'angular-ng22',
          include: ['test/**/*.browser.spec.ts'],
          setupFiles: ['test/setup-jit.ts'],
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
  },
});
