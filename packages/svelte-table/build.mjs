// Builds @guiexpert/svelte-table: the component is shipped as Svelte SOURCE (compiled by the
// consumer's Svelte 4 or 5 compiler), the TypeScript helpers are compiled with tsc.
import { cpSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

rmSync("dist", { recursive: true, force: true });
execSync("tsc -p tsconfig.build.json", { stdio: "inherit" });
for (const f of ["src/GuiexpertTable.svelte", "src/GuiexpertTable.svelte.d.ts"]) {
  cpSync(f, f.replace(/^src\//, "dist/"));
}
for (const f of ["README.md", "LICENSE", "package.json"]) {
  cpSync(f, `dist/${f}`);
}
console.log("✔ built dist/ (Svelte source + compiled helpers)");
