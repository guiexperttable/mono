// Generates the API reference of @guiexpert/table and hands it to the website.
//
//   pnpm --filter @guiexpert/table typedoc:website
//
// 1. typedoc (config: typedoc.json) → HTML, JSON and Markdown in apps/table-website/src/assets/{docs,json,docsmd}
// 2. HTML → apps/webpage-guiexpert/public/api        (served as https://gui.expert/api/…, index.html → overview.html)
//    JSON → apps/webpage-guiexpert/src/content/docs/doctype.json
//    MD   → apps/webpage-guiexpert/src/content/docsmd
// 3. apps/webpage-guiexpert/src/training/api-index.json (the training checks its API links against it)
import { execSync } from "node:child_process";
import { cpSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(pkg, "../..");
const assets = path.join(repo, "apps/table-website/src/assets");
const web = path.join(repo, "apps/webpage-guiexpert");

const run = (cmd, cwd = pkg) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
};

rmSync(path.join(assets, "docs"), { recursive: true, force: true });
rmSync(path.join(assets, "docsmd"), { recursive: true, force: true });
run(`npx typedoc --out ${path.join(assets, "docs")}`);
run(`npx typedoc --json ${path.join(assets, "json/doctype.json")}`);
run(`npx typedoc --plugin typedoc-plugin-markdown --out ${path.join(assets, "docsmd")}`);

rmSync(path.join(web, "public/api"), { recursive: true, force: true });
cpSync(path.join(assets, "docs"), path.join(web, "public/api"), { recursive: true });
// /api/ itself is an Astro page (src/pages/api.astro) – a public/api/index.html would collide with it.
// The typedoc start page (typedoc-readme.md) is served as /api/overview.html instead.
renameSync(path.join(web, "public/api/index.html"), path.join(web, "public/api/overview.html"));
cpSync(path.join(assets, "json/doctype.json"), path.join(web, "src/content/docs/doctype.json"));
rmSync(path.join(web, "src/content/docsmd"), { recursive: true, force: true });
cpSync(path.join(assets, "docsmd"), path.join(web, "src/content/docsmd"), { recursive: true });

run(`node scripts/build-api-index.mjs ${path.join(assets, "json/doctype.json")}`, web);
console.log("API reference updated.");
