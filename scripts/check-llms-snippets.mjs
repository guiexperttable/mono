#!/usr/bin/env node
// Compiles every ```ts block of llms.txt (prompt 020) on its own against packages/table/src – tsc --strict, like the
// instructions.md snippets. Blocks that import a framework (react, @angular/…, a wrapper package) are display-only
// and skipped (fence them as ```tsx / ```vue / ```svelte, or they are reported as skipped).
//
//   pnpm check:llms              (root)
//   node scripts/check-llms-snippets.mjs [file …]   (default: llms.txt)
//
// Each block is a module: it must import what it uses and `declare` what it does not create (host, tableApi …).
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2).length ? process.argv.slice(2) : ['llms.txt'];
const tsc = join(root, 'packages/table/node_modules/typescript/bin/tsc');
const FRAMEWORK_IMPORT = /from\s+["'](react|preact|solid-js|vue|svelte|@angular\/[^"']+|@guiexpert\/(react|preact|solid|svelte|vue3|webcomponent|angular)-table)["']/;

const dir = mkdtempSync(join(tmpdir(), 'llms-snippets-'));
let compiled = 0;
let skipped = 0;
const origin = new Map();
try {
  for (const file of files) {
    const text = readFileSync(resolve(root, file), 'utf8');
    const lines = text.split('\n');
    let inBlock = false;
    let start = 0;
    let body = [];
    lines.forEach((line, i) => {
      if (!inBlock && /^```ts\s*$/.test(line)) {
        inBlock = true;
        start = i + 1;
        body = [];
      } else if (inBlock && /^```\s*$/.test(line)) {
        inBlock = false;
        const code = body.join('\n');
        if (FRAMEWORK_IMPORT.test(code)) {
          skipped++;
          return;
        }
        const name = `snippet-${String(compiled).padStart(3, '0')}.ts`;
        // a CSS import is a bundler feature: replace it for tsc
        writeFileSync(join(dir, name), code.replace(/^import\s+["'][^"']+\.css["'];.*$/gm, '') + '\nexport {};\n');
        origin.set(name, `${file}:${start + 1}`);
        compiled++;
      } else if (inBlock) {
        body.push(line);
      }
    });
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      strict: true, target: 'es2022', module: 'esnext', moduleResolution: 'bundler', noEmit: true, skipLibCheck: true,
      lib: ['es2022', 'dom', 'dom.iterable'], baseUrl: '.',
      paths: { '@guiexpert/table': [join(root, 'packages/table/src/index.ts')] },
      noUnusedLocals: false,
    },
    include: ['*.ts'],
  }, null, 2));
  try {
    execFileSync(process.execPath, [tsc, '-p', join(dir, 'tsconfig.json')], { stdio: 'pipe' });
    console.log(`✓ ${compiled} snippets compile (${skipped} framework snippets skipped)`);
  } catch (e) {
    const out = String(e.stdout ?? '') + String(e.stderr ?? '');
    const own = out.split('\n').filter(l => l.includes('snippet-'))
      .map(l => l.replace(/^.*?(snippet-\d+\.ts)/, (_m, n) => `${origin.get(n)} (${n})`));
    console.error(own.length ? own.join('\n') : out);
    console.error(`✗ snippets of ${files.join(', ')} do not compile`);
    process.exitCode = 1;
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
