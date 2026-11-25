// Every showcase of gui.expert (/showcase/<n>/run/ and /info/), generated from src/pages/showcase/*/.
import { test, expect, expectTable, tryInteraction } from '../fixtures.ts';
import { showcaseTargets } from '../targets.ts';
import { isPlaceholder } from '../exceptions.ts';

for (const t of showcaseTargets('run')) {
  test(t.id, async ({ page }) => {
    const response = await page.goto(t.url);
    expect(response?.status()).toBe(200);
    if (isPlaceholder(t.id)) return;                  // E7: only "loads without errors" (the guard checks at the end)
    const table = await expectTable(page);
    await tryInteraction(page, table, t.id);
  });
}

for (const t of showcaseTargets('info')) {
  test(t.id, async ({ page }) => {
    const response = await page.goto(t.url);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('load');
  });
}
