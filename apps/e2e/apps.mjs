// The built apps the E2E tests open (prompt 026): name, dist folder, port of serve-dist.mjs, dev command (E2E_DEV=1).
// Shared by serve-dist.mjs (plain Node) and playwright.config.ts / targets.ts.
//
// A new app under apps/ with a `build` script must be listed here – targets.spec.ts checks that none is missing.
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const HEALTH_PORT = 4800;
/** `ng serve` of angular-table-demo for the project `angular-dev` (the pre-bundle bug of CLAUDE.md §2 only shows there). */
export const ANGULAR_DEV_PORT = 4850;

const app = (name, port, extra = {}) => ({
  name,
  port,
  dir: join(REPO_ROOT, 'apps', name, extra.dist ?? 'dist'),
  spa: false,
  // vite dev of the app; `--strictPort` = red instead of a silently different port
  dev: `pnpm --filter ${name} dev --port ${port} --strictPort`,
  ...extra,
});

/** @type {{ name: string, port: number, dir: string, spa: boolean, dev: string, kind: 'website' | 'table-demo' | 'framework' }[]} */
export const APPS = [
  app('webpage-guiexpert', 4801, { kind: 'website', dev: 'pnpm --filter webpage-guiexpert dev --port 4801' }),
  app('table-demo', 4802, { kind: 'table-demo' }),
  app('angular-table-demo', 4803, {
    kind: 'framework', dist: 'dist/angular-table-demo/browser', spa: true,
    dev: 'pnpm --filter angular-table-demo start --port 4803',
  }),
  app('angular-signal-demo', 4804, { kind: 'framework' }),
  app('preact-table-demo', 4805, { kind: 'framework' }),
  app('react-table-demo', 4806, { kind: 'framework' }),
  app('solid-table-demo', 4807, { kind: 'framework' }),
  app('svelte-table-demo', 4808, { kind: 'framework' }),
  app('ts-todo-demo', 4809, { kind: 'framework' }),
  app('vue3-multi-demo', 4810, { kind: 'framework', spa: true }),
  app('vue3-table-demo', 4811, { kind: 'framework' }),
  app('webcomponent-table-demo', 4812, { kind: 'framework' }),
];

/** Apps under apps/ that are not opened by a browser test. */
export const NOT_E2E_APPS = ['e2e', 'table-website'];

export const appUrl = (name, path = '/') => {
  const a = APPS.find(x => x.name === name);
  if (!a) throw new Error(`unknown app ${name}`);
  // serve-dist listens on 127.0.0.1; the dev servers on `localhost` (may be ::1 only on macOS)
  return `http://${process.env.E2E_DEV ? 'localhost' : '127.0.0.1'}:${a.port}${path}`;
};
