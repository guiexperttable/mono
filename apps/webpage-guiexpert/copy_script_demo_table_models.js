import {default as fse} from "fs-extra";

// Copies the built ESM bundle into public/scripts/ (git-ignored). The showcases import it via
// <script type="module"> from '/scripts/demo-table-models/index.js'; without it the tables stay empty.
const target = 'public/scripts/demo-table-models';
const src = '../../packages/demo-table-models/dist';

if (!fse.existsSync(src + '/index.js')) {
  console.error(`${src}/index.js not found. Build it first: pnpm build:core && pnpm --filter @guiexpert/demo-table-models build (or pnpm build:libs) in the repo root.`);
  process.exit(1);
}
fse.removeSync(target);
fse.copySync(src, target);
console.log(`copied ${src} -> ${target}`);
