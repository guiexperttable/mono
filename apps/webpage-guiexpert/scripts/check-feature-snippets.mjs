// Type check of the code snippets of src/features/new-features.ts (page /whats-new/, home page) against the built core.
//   pnpm build:core && pnpm --filter webpage-guiexpert check:features
// Every snippet is compiled as its own module with a small prelude (all exports of the core + a few declared names).
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NEW_FEATURES } from "../src/features/new-features.ts";

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, "..");
const core = resolve(site, "../../packages/table");
const out = join(site, "node_modules/.feature-snippets");

const prelude = `import * as GE from "@guiexpert/table";
import { AutoRestoreOptions, ColumnDef, PivotFactory, RowGroupFactory, SelectionModel, TableFactory, TableOptions } from "@guiexpert/table";
import type { GeRowDragEvent, TableApi, TableOptionsIf } from "@guiexpert/table";
interface OrderItem { sku: string; qty: number }
interface Order { id: number; country: string; city: string; category: string; year: number; quantity: number; total: number; items: OrderItem[] }
interface Item { product: string; price: number; quantity: number }
interface Task { id: number; title: string }
declare const orders: Order[];
declare const tasks: Task[];
declare const tableApi: TableApi;
declare const listener: GE.EventAdapter;
declare const saveButton: HTMLButtonElement;
declare function save(rows: unknown[]): void;
declare function sendToServer(changes: unknown): Promise<void>;
void GE; void AutoRestoreOptions; void ColumnDef; void PivotFactory; void RowGroupFactory; void SelectionModel; void TableFactory; void TableOptions;
`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const files = NEW_FEATURES.map(f => {
  const file = join(out, `${f.id}.ts`);
  writeFileSync(file, `${prelude}\nexport async function snippet() {\n${f.snippet}\n}\n`);
  return file;
});
writeFileSync(join(out, "tsconfig.json"), JSON.stringify({
  compilerOptions: {
    target: "ES2022", module: "ESNext", moduleResolution: "Bundler", strict: true, noEmit: true, skipLibCheck: true,
    noUnusedLocals: false, lib: ["ES2022", "DOM", "DOM.Iterable"], types: [],
    paths: { "@guiexpert/table": [join(core, "dist/index.d.ts")] }
  },
  files
}, null, 2));

try {
  execFileSync(process.execPath, [join(core, "node_modules/typescript/bin/tsc"), "-p", join(out, "tsconfig.json")], { stdio: "inherit" });
  console.log(`✓ ${files.length} feature snippets compile`);
} catch {
  console.error("✗ feature snippets do not compile (see above)");
  process.exit(1);
}
