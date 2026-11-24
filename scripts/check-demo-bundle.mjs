#!/usr/bin/env node
// Bundle check of @guiexpert/demo-table-models (prompt 025, finding G11): an app that imports one small export of the
// demo package must not get the big demo data sets (Seattle weather 8,759 values, tree persons 5 MB) – before 1.1.116
// a side effect on module level kept 613 kB of weather data in every app.
//
// Builds three mini apps with Vite (production, minified) like a consumer: the packages are linked from their `dist`
// folders into a temporary node_modules (`preserveSymlinks`, so `dist/package.json` – with `"sideEffects": false` – is
// the package manifest, as after an npm install):
//
//   core           import { CoverGridFactory } from "@guiexpert/table"                 – the reference
//   cover-renderer import { BookCoverRenderer } from "@guiexpert/demo-table-models"
//   generate-books import { generateBooks } from "@guiexpert/demo-table-models"
//
// Red, if a demo app contains one of the data markers or is more than MAX_EXTRA_KB larger than the core app. A demo
// module must not compute anything on module level (no loop, no `.map()`, no `new X()`) – or wrap it in a function
// marked /* @__PURE__ */ (see createTimeTableModel.ts); `"sideEffects": false` alone does not help, dist/index.js is
// one file.
// Needs the builds: pnpm build:core && pnpm --filter @guiexpert/demo-table-models build
//
//   pnpm check:bundle
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tableDist = join(root, 'packages', 'table', 'dist');
const demoDist = join(root, 'packages', 'demo-table-models', 'dist');

/**
 * Allowed growth of a demo app over the core app (minified). 1.1.116: both demo apps are smaller than the core app
 * (BookCoverRenderer −0.7 kB, generateBooks −7.7 kB); the module-level values of the time table alone were +15 kB.
 */
const MAX_EXTRA_KB = 10;

/** Strings that exist only in the big data sets. */
const DATA_MARKERS = [
  ['Seattle weather', '2010-01-01T01:00'],
  ['tree persons', 'Prename205'],
  ['persons1000', 'mreide0@tripod.com'],
  ['time table', 'Team TCC'],
  ['heat map', '2009 27.9'],
];

const APPS = [
  ['core', `import { CoverGridFactory } from "@guiexpert/table";\nconsole.log(CoverGridFactory);\n`],
  ['cover-renderer', `import { BookCoverRenderer } from "@guiexpert/demo-table-models";\nconsole.log(new BookCoverRenderer());\n`],
  ['generate-books', `import { generateBooks } from "@guiexpert/demo-table-models";\nconsole.log(generateBooks(3));\n`],
];

for (const dist of [tableDist, demoDist]) {
  if (!existsSync(join(dist, 'index.js')) || !existsSync(join(dist, 'package.json'))) {
    console.error(`✗ ${dist} is missing – first: pnpm build:core && pnpm --filter @guiexpert/demo-table-models build`);
    process.exit(1);
  }
}

// vite is a devDependency of the demo package (not of the root)
const requireFromDemo = createRequire(join(root, 'packages', 'demo-table-models', 'package.json'));
const { build } = await import(pathToFileURL(requireFromDemo.resolve('vite')).href);

const work = mkdtempSync(join(tmpdir(), 'ge-demo-bundle-'));
const kb = (n) => (n / 1024).toFixed(1).padStart(8) + ' kB';
let failed = false;

try {
  const scope = join(work, 'node_modules', '@guiexpert');
  mkdirSync(scope, { recursive: true });
  symlinkSync(tableDist, join(scope, 'table'), 'dir');
  symlinkSync(demoDist, join(scope, 'demo-table-models'), 'dir');

  const rows = [];
  for (const [name, code] of APPS) {
    const entry = join(work, `${name}.js`);
    writeFileSync(entry, code);
    const output = await build({
      root: work,
      configFile: false,
      logLevel: 'silent',
      resolve: { preserveSymlinks: true },
      build: { write: false, minify: true, emptyOutDir: false, rollupOptions: { input: entry } },
    });
    const chunks = (Array.isArray(output) ? output : [output]).flatMap(o => o.output).filter(o => o.type === 'chunk');
    const js = chunks.map(c => c.code).join('\n');
    const found = DATA_MARKERS.filter(([, marker]) => js.includes(marker)).map(([label]) => label);
    rows.push({ name, size: Buffer.byteLength(js), gzip: gzipSync(js).length, found: [...new Set(found)] });
  }

  const core = rows[0];
  console.log('\nBundle check @guiexpert/demo-table-models (Vite, minified)\n');
  console.log('app'.padEnd(16) + 'size'.padStart(11) + 'gzip'.padStart(11) + '   vs. core');
  for (const row of rows) {
    const extra = row.size - core.size;
    let verdict = '';
    if (row !== core) {
      const tooBig = extra > MAX_EXTRA_KB * 1024;
      failed ||= tooBig || row.found.length > 0;
      verdict = `   ${extra < 0 ? '−' : '+'}${(Math.abs(extra) / 1024).toFixed(1)} kB`
        + (tooBig ? `  ✗ more than ${MAX_EXTRA_KB} kB` : '')
        + (row.found.length ? `  ✗ contains: ${row.found.join(', ')}` : '');
    }
    console.log(row.name.padEnd(16) + kb(row.size) + '  ' + kb(row.gzip) + verdict);
  }
  console.log(`\ndist/index.js: demo-table-models ${kb(statSync(join(demoDist, 'index.js')).size).trim()},`
    + ` table ${kb(statSync(join(tableDist, 'index.js')).size).trim()}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failed) {
  console.error('\n✗ an app that imports one small export of @guiexpert/demo-table-models gets the demo data sets.'
    + ' Look for code on module level (a call, a loop) next to the data – see packages/demo-table-models/README.md.\n');
  process.exit(1);
}
console.log('\n✓ no demo data in the mini apps\n');
