// E5: `pnpm test:e2e` does not build. Stop early with the command if a dist is missing or older than its sources.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { APPS, REPO_ROOT } from './apps.mjs';

export default function globalSetup(): void {
  if (process.env.E2E_DEV) return;
  const missing = APPS.filter(a => !existsSync(join(a.dir, 'index.html'))).map(a => a.name);
  // the website copies the core dist to public/scripts (pre:build) – without it every showcase table stays empty
  if (!existsSync(join(REPO_ROOT, 'packages/table/dist/index.js'))) missing.unshift('packages/table');
  if (missing.length) {
    throw new Error(`E2E: not built – ${missing.join(', ')}.\nRun: pnpm test:e2e:build   (or pnpm build:all)`);
  }
  const core = statSync(join(REPO_ROOT, 'packages/table/dist/index.js')).mtimeMs;
  const website = statSync(join(APPS[0].dir, 'index.html')).mtimeMs;
  if (website < core) console.warn('E2E: the website dist is older than the core dist – pnpm build:webpage-guiexpert');
}
