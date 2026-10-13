/**
 * Adds explicit ".js" extensions to the relative imports of emitted declaration files (*.d.ts).
 *
 * vite-plugin-dts writes `export * from './lib/table/table-api'`. In a "type": "module" package every .d.ts is an
 * ES module, and TypeScript with "moduleResolution": "node16" / "nodenext" requires explicit extensions in ES
 * modules – without them all re-exports fail (TS2834 / TS2307) and users get "has no exported member TableFactory".
 * Bundler and node10 resolution understand both forms, so the rewrite is safe for everybody:
 *
 *   './x'          → './x.js'          (x.d.ts exists)
 *   './dir', '../' → './dir/index.js'  (dir/index.d.ts exists)
 *   './X.vue'      → './X.vue.js'      (X.vue.d.ts exists – TypeScript maps .js to .d.ts)
 *
 * Specifiers that already have a .js/.mjs/.cjs/.json extension or that don't resolve to a declaration file
 * (e.g. './Table.svelte', package imports) are left as they are.
 *
 * Used by the vite configs of the library packages (dts plugin hook `afterBuild`), also usable as CLI:
 *
 *   node scripts/fix-dts-imports.mjs packages/table/dist
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// from '…' | import('…') | import '…'  (also `export … from`, `import type … from`)
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.\.?(?:\/[^'"\n]*)?)\2/g;

function listDts(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" ? [] : listDts(path);
    return e.name.endsWith(".d.ts") ? [path] : [];
  });
}

function withExtension(fileDir, specifier) {
  if (/\.(m|c)?js$|\.json$/.test(specifier)) return specifier;
  const target = resolve(fileDir, specifier);
  if (!specifier.endsWith("/") && existsSync(target + ".d.ts")) return specifier + ".js";
  if (existsSync(join(target, "index.d.ts")) && statSync(target).isDirectory()) {
    return specifier.replace(/\/?$/, "/index.js");
  }
  return specifier;
}

/**
 * Rewrites the relative imports of all .d.ts files below `dir` (in place).
 *
 * @param {string} dir - e.g. the dist folder of a package
 * @returns {{ files: number, changed: number }} number of declaration files and of rewritten specifiers
 */
export function fixDtsImports(dir) {
  const files = listDts(dir);
  let changed = 0;
  for (const file of files) {
    const fileDir = dirname(file);
    const text = readFileSync(file, "utf8");
    const out = text.replace(SPECIFIER, (match, prefix, quote, specifier) => {
      const fixed = withExtension(fileDir, specifier);
      if (fixed === specifier) return match;
      changed++;
      return `${prefix}${quote}${fixed}${quote}`;
    });
    if (out !== text) writeFileSync(file, out);
  }
  return { files: files.length, changed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) {
    console.error("usage: node scripts/fix-dts-imports.mjs <dist-dir> [<dist-dir> …]");
    process.exit(1);
  }
  for (const dir of dirs) {
    const { files, changed } = fixDtsImports(dir);
    console.log(`${dir}: ${changed} relative imports in ${files} declaration files got an extension`);
  }
}
