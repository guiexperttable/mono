// Smoke tests of the Svelte wrapper in a real browser (Vitest 5 browser mode, headless Chromium via Playwright).
//
//   pnpm --filter @guiexpert/svelte-table test          (all wrappers: pnpm test:wrappers)
//   once: pnpm --filter @guiexpert/svelte-table exec playwright install chromium   (or set CHROMIUM_PATH)
//
// Like packages/table/vitest.config.ts deliberately independent of vite.config.ts (no dts/static-copy plugins).
// `@guiexpert/table` is resolved to the core SOURCE (packages/table/src/index.ts): no core build needed, and the
// wrapper, the specs and packages/table/test-utils share one instance of the core.
//
// The package ships GuiexpertTable.svelte as SOURCE, compiled by the user's Svelte 4 or 5 – so it is tested twice:
//   project "svelte5"  *.svelte5.browser.spec.ts  official plugin, without svelte.config.cjs (configFile: false –
//                      like an app without preprocessor: the component is plain JS and must compile as is)
//   project "svelte4"  *.svelte4.browser.spec.ts  Svelte 4.2 (devDependency "svelte4": "npm:svelte@^4") compiles the
//                      component, `svelte` is aliased to it (vite-plugin-svelte for Svelte 4 does not support Vite 6)
// Specs live next to the code (not part of the npm package – build.mjs ships only GuiexpertTable.svelte + the
// compiled helpers); test-only Svelte components in test/.
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { compile as compileSvelte4 } from 'svelte4/compiler';
import { fileURLToPath } from 'node:url';

// Optional: use a preinstalled Chromium instead of Playwright's own download (e.g. in a container).
const chromiumPath = process.env['CHROMIUM_PATH'];

/** A fresh object per project (Vitest writes the project name into `instances`). */
const browser = () => ({
  enabled: true,
  headless: true,
  provider: playwright(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
  instances: [{ browser: 'chromium' as const }],
  viewport: { width: 1200, height: 900 },
});

/** Minimal Svelte 4 compile step for *.svelte files (dev mode, CSS injected). */
function svelte4(): Plugin {
  return {
    name: 'test-svelte4-compile',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.svelte')) {
        return undefined;
      }
      const { js } = compileSvelte4(code, { filename: id, dev: true, css: 'injected' });
      return { code: js.code, map: js.map };
    },
  };
}

export default defineConfig({
  resolve: {
    alias: { '@guiexpert/table': fileURLToPath(new URL('../table/src/index.ts', import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [svelte({ configFile: false })],
        test: {
          name: 'svelte5',
          include: ['src/**/*.svelte5.browser.spec.ts'],
          browser: browser(),
        },
      },
      {
        extends: true,
        plugins: [svelte4()],
        resolve: {
          // runtime imports of the compiled component ("svelte", "svelte/internal", …) → Svelte 4
          alias: [{ find: /^svelte(?=\/|$)/, replacement: 'svelte4' }],
        },
        optimizeDeps: {
          include: ['svelte4', 'svelte4/internal', 'svelte4/internal/disclose-version'],
        },
        test: {
          name: 'svelte4',
          include: ['src/**/*.svelte4.browser.spec.ts'],
          browser: browser(),
        },
      },
    ],
  },
});
