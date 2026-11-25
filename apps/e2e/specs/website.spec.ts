// Top-level pages of gui.expert: only the guard – loads without console/network problems.
import { test, expect } from '../fixtures.ts';
import { websiteTargets } from '../targets.ts';

for (const t of websiteTargets()) {
  test(t.id, async ({ page }) => {
    const response = await page.goto(t.url);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('load');
  });
}
