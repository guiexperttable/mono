// apps/table-demo: every *.html page (plain TypeScript demos of the core).
import { test, expect, expectTables, tryInteraction } from '../fixtures.ts';
import { tableDemoTargets } from '../targets.ts';
import { hasNoTable } from '../exceptions.ts';

for (const t of tableDemoTargets()) {
  test(t.id, async ({ page }) => {
    const response = await page.goto(t.url);
    expect(response?.status()).toBe(200);
    if (hasNoTable(t.id)) return;
    await expectTables(page);
    await tryInteraction(page, page.locator('.ge-table').first(), t.id);
  });
}
