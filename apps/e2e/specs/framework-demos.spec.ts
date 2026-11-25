// The framework demo apps (React, Vue, Svelte, Solid, Preact, Web Component, Angular 17 + 22, TS todo).
import { test, expect, expectOneAngular, expectTables, tryInteraction } from '../fixtures.ts';
import { frameworkTargets } from '../targets.ts';
import { hasNoTable } from '../exceptions.ts';

for (const t of frameworkTargets()) {
  test(t.id, async ({ page }) => {
    const response = await page.goto(t.url);
    expect(response?.status()).toBe(200);
    if (t.angularMajor) await expectOneAngular(page, t.angularMajor);
    if (hasNoTable(t.id)) return;
    await expectTables(page);
    await tryInteraction(page, page.locator('.ge-table').first(), t.id);
  });
}
