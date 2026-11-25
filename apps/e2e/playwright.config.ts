// E2E smoke tests of the built apps (prompt 026, design prompts/026-e2e-playwright.design.md).
//
//   pnpm test:e2e            Chromium + Firefox against the dists (serve-dist.mjs) + project angular-dev (ng serve)
//   pnpm test:e2e:build      builds everything the tests open (core, demo models, ng22, website, demo apps)
//   E2E_WEBKIT=1             also WebKit
//   E2E_SKIP_FIREFOX=1       without Firefox (does not start on macOS 27.2 with Playwright 1.64, see README)
//   E2E_DEV=1                the dev servers instead of the dists (local only)
//
// Core behaviour → Vitest (packages/table); built apps → Playwright (this package).
import { defineConfig, devices } from '@playwright/test';
import { APPS, HEALTH_PORT, ANGULAR_DEV_PORT } from './apps.mjs';

const CI = !!process.env.CI;
const DEV = !!process.env.E2E_DEV;
const WEBKIT = !!process.env.E2E_WEBKIT;
/** Firefox 157 of Playwright 1.64 does not start on macOS 27.2 ("Could not find profile folder", Nov. 2026) – CI runs it. */
const FIREFOX = !process.env.E2E_SKIP_FIREFOX;
/** test:e2e:website does not need `ng serve` (~15 s start). */
const ANGULAR_DEV = !process.env.E2E_SKIP_ANGULAR_DEV;

const use = {
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'reduce' as const,
  trace: 'retain-on-failure' as const,
  screenshot: 'only-on-failure' as const,
};
const SMOKE = /specs\/(website|showcases|training|table-demo|framework-demos|targets)\.spec\.ts/;

const staticServer = {
  command: 'node serve-dist.mjs',
  url: `http://127.0.0.1:${HEALTH_PORT}/`,
  reuseExistingServer: !CI,
  timeout: 30_000,
};
const devServers = APPS.map(a => ({
  command: a.dev,
  cwd: '../..',
  url: `http://localhost:${a.port}/`,
  reuseExistingServer: true,
  timeout: 120_000,
}));
const angularDevServer = {
  command: `pnpm --filter angular-table-demo start --port ${ANGULAR_DEV_PORT}`,
  cwd: '../..',
  url: `http://localhost:${ANGULAR_DEV_PORT}/`,
  reuseExistingServer: !CI,
  timeout: 180_000,
};

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  globalSetup: './global-setup.ts',
  webServer: [...(DEV ? devServers : [staticServer]), ...(ANGULAR_DEV ? [angularDevServer] : [])],
  projects: [
    { name: 'chromium', testMatch: SMOKE, use: { ...devices['Desktop Chrome'], ...use } },
    ...(FIREFOX ? [{ name: 'firefox', testMatch: SMOKE, use: { ...devices['Desktop Firefox'], ...use } }] : []),
    ...(WEBKIT ? [{ name: 'webkit', testMatch: SMOKE, use: { ...devices['Desktop Safari'], ...use } }] : []),
    // the "two Angular versions in the Vite pre-bundle" bug (CLAUDE.md §2) only shows in `ng serve`
    ...(ANGULAR_DEV ? [{ name: 'angular-dev', testMatch: /specs\/angular-dev\.spec\.ts/, use: { ...devices['Desktop Chrome'], ...use } }] : []),
  ],
});
