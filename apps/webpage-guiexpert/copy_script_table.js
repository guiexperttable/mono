import {default as fse} from "fs-extra";

// Copies the built ESM bundle into public/scripts/ (git-ignored). The showcases import it via
// <script type="module"> from '/scripts/table/index.js'; without it the tables stay empty.
const target = 'public/scripts/table';
const src = '../../packages/table/dist';

if (!fse.existsSync(src + '/index.js')) {
  console.error(`${src}/index.js not found. Build it first: pnpm build:core && pnpm --filter @guiexpert/demo-table-models build (or pnpm build:libs) in the repo root.`);
  process.exit(1);
}
fse.removeSync(target);
fse.copySync(src, target);
console.log(`copied ${src} -> ${target}`);
