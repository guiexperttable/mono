// The list of E2E targets, generated from the repository (prompt 026, decision E6): a new showcase, training chapter,
// table-demo page or Angular route is tested without touching this package.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { APPS, REPO_ROOT, appUrl } from './apps.mjs';
import { CHAPTERS } from '../webpage-guiexpert/src/training/chapters.ts';

export interface TargetIf {
  /** Test title and key of exceptions.ts, e.g. `showcase large`. */
  id: string;
  url: string;
}

const WEBSITE = join(REPO_ROOT, 'apps/webpage-guiexpert/src/pages');
const site = (path: string) => appUrl('webpage-guiexpert', path);
const astroPages = (dir: string) => readdirSync(dir).filter(f => f.endsWith('.astro')).map(f => f.replace(/\.astro$/, ''));

/** Top-level pages of gui.expert (`/`, `/showcase/`, `/whats-new/` …): only the guard (loads without errors). */
export function websiteTargets(): TargetIf[] {
  return astroPages(WEBSITE).map(p => {
    const path = p === 'index' ? '/' : `/${p}/`;
    return { id: `website ${path}`, url: site(path) };
  });
}

export function showcaseNames(): string[] {
  const dir = join(WEBSITE, 'showcase');
  return readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
}

/** `/showcase/<n>/run/` (the table) and `/showcase/<n>/info/` (the description). */
export function showcaseTargets(page: 'run' | 'info'): TargetIf[] {
  return showcaseNames()
    .filter(n => existsSync(join(WEBSITE, 'showcase', n, `${page}.astro`)))
    .map(n => ({ id: page === 'run' ? `showcase ${n}` : `showcase ${n} info`, url: site(`/showcase/${n}/${page}/`) }));
}

export interface TrainingTargetIf extends TargetIf {
  slug: string;
  /** Number of `<LiveDemo>` in the page source – each must become a started demo. */
  liveDemos: number;
}

/** Every page under /training/: the 40 chapters of chapters.ts plus the extra pages (index, checklist …). */
export function trainingTargets(): TrainingTargetIf[] {
  const dir = join(WEBSITE, 'training');
  return astroPages(dir).map(slug => {
    const source = readFileSync(join(dir, `${slug}.astro`), 'utf8');
    const path = slug === 'index' ? '/training/' : `/training/${slug}/`;
    return { id: `training ${slug}`, slug, url: site(`${path}?demos`), liveDemos: (source.match(/<LiveDemo\b/g) ?? []).length };
  });
}

/** Slugs of chapters.ts – trainingTargets() must cover all of them (control test). */
export const chapterSlugs = (): string[] => CHAPTERS.map(c => c.slug);

/** `apps/table-demo/*.html` (built with every page since prompt 026, B1). */
export function tableDemoTargets(): TargetIf[] {
  return readdirSync(join(REPO_ROOT, 'apps/table-demo'))
    .filter(f => f.endsWith('.html'))
    .sort()
    .map(f => ({ id: `table-demo ${f}`, url: appUrl('table-demo', f === 'index.html' ? '/' : `/${f}`) }));
}

export interface FrameworkTargetIf extends TargetIf {
  app: string;
  /** Angular major expected in `[ng-version]` (E10), undefined for other frameworks. */
  angularMajor?: number;
}

const ANGULAR_MAJOR: Record<string, number> = { 'angular-table-demo': 17, 'angular-signal-demo': 22 };

/** Routes of angular-table-demo, read from its `routerLink="/demo/…"` (the routes are lazy modules with path "demo"). */
export function angularDemoRoutes(): string[] {
  const routes = new Set<string>();
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html') || e.name.endsWith('.ts')) {
        for (const m of readFileSync(p, 'utf8').matchAll(/routerLink="(\/demo\/[^"]+)"/g)) routes.add(m[1]);
      }
    }
  };
  walk(join(REPO_ROOT, 'apps/angular-table-demo/src'));
  return [...routes].sort();
}

/** Routes of vue3-multi-demo: `new DemoItem("Label", "/path", …)` in src/router/demos.ts (vue-router, web history). */
export function vueMultiDemoRoutes(): string[] {
  const source = readFileSync(join(REPO_ROOT, 'apps/vue3-multi-demo/src/router/demos.ts'), 'utf8');
  return [...source.matchAll(/new DemoItem\(\s*"[^"]*",\s*"(\/[^"]+)"/g)].map(m => m[1]).sort();
}

const APP_ROUTES: Record<string, () => string[]> = {
  'angular-table-demo': angularDemoRoutes,
  'vue3-multi-demo': vueMultiDemoRoutes,
};

/** One test per framework demo app (start page), plus every route of angular-table-demo and vue3-multi-demo. */
export function frameworkTargets(base: (app: string, path: string) => string = appUrl): FrameworkTargetIf[] {
  const out: FrameworkTargetIf[] = [];
  for (const a of APPS.filter(x => x.kind === 'framework')) {
    out.push({ id: `app ${a.name}`, app: a.name, url: base(a.name, '/'), angularMajor: ANGULAR_MAJOR[a.name] });
    if (APP_ROUTES[a.name]) {
      for (const r of APP_ROUTES[a.name]()) {
        out.push({ id: `app ${a.name} ${r}`, app: a.name, url: base(a.name, r), angularMajor: ANGULAR_MAJOR[a.name] });
      }
    }
  }
  return out;
}

/** Apps under apps/ that have a `build` script – each must be in APPS or NOT_E2E_APPS (control test). */
export function appsWithBuildScript(): string[] {
  const dir = join(REPO_ROOT, 'apps');
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(dir, d.name, 'package.json')))
    .filter(d => !!JSON.parse(readFileSync(join(dir, d.name, 'package.json'), 'utf8')).scripts?.build)
    .map(d => d.name)
    .sort();
}
