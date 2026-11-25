// gui.expert/training: every chapter with `?demos` (runtime.ts starts all live demos at once, E9).
import { test, expect, expectTableShowsSomething } from '../fixtures.ts';
import { trainingTargets } from '../targets.ts';
import { hasNoTable } from '../exceptions.ts';

const TARGETS = trainingTargets();

for (const t of TARGETS) {
  test(t.id, async ({ page }) => {
    const response = await page.goto(t.url);
    expect(response?.status()).toBe(200);
    const demos = page.locator('.training-demo');
    await expect(demos, 'every <LiveDemo> of the page source is rendered').toHaveCount(t.liveDemos);
    for (let i = 0; i < t.liveDemos; i++) {
      const demo = demos.nth(i);
      const name = await demo.getAttribute('data-demo');
      await expect(demo.locator('.td-info'), `demo ${name}: no error`).not.toContainText('error:');
      await expect(demo, `demo ${name} started`).toHaveAttribute('data-ready', '1');
      if (hasNoTable(`training-demo ${name}`)) continue;
      await expectTableShowsSomething(demo.locator('.ge-table').first());
    }
  });
}

// The build checks <ChapterLink>/<ApiLink>/showcases; free `href`s to /showcase/… and /training/… are not checked there.
test('internal links of the training pages answer 200', async ({ page, request, browserName }) => {
  test.skip(browserName !== 'chromium', 'HTTP only – once is enough');
  test.setTimeout(120_000);
  const links = new Set<string>();
  for (const t of TARGETS) {
    await page.goto(t.url.replace('?demos', ''));
    const hrefs = await page.locator('a[href^="/showcase/"], a[href^="/training/"]').evaluateAll(
      as => as.map(a => (a as HTMLAnchorElement).href.split('#')[0]));
    hrefs.forEach(h => links.add(h));
  }
  const broken: string[] = [];
  for (const href of links) {
    const r = await request.get(href);
    if (r.status() !== 200) broken.push(`${r.status()} ${href}`);
  }
  expect(broken).toEqual([]);
});
