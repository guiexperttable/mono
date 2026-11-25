// angular-table-demo in `ng serve` (project angular-dev, Chromium only): the dev server pre-bundles the
// dependencies with Vite – two Angular versions there gave an empty page (CLAUDE.md §2), the build does not show it.
import { test, expect, expectOneAngular, expectTables } from '../fixtures.ts';
import { hasNoTable } from '../exceptions.ts';
import { angularDemoRoutes } from '../targets.ts';
import { ANGULAR_DEV_PORT } from '../apps.mjs';

const url = (path: string) => `http://localhost:${ANGULAR_DEV_PORT}${path}`;

for (const path of ['/', ...angularDemoRoutes()]) {
  // same title as in framework-demos.spec.ts → same exceptions (the project name tells the runs apart)
  const id = path === '/' ? 'app angular-table-demo' : `app angular-table-demo ${path}`;
  test(id, async ({ page }) => {
    const response = await page.goto(url(path));
    expect(response?.status()).toBe(200);
    await expectOneAngular(page, 17);
    if (hasNoTable(id)) return;
    await expectTables(page);
  });
}
