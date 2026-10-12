// Type-checks every @example block (and ```ts fences in descriptions) of the JSDoc in src/ against the real API.
// The examples become the API reference on https://gui.expert/api – a wrong example is worse than none.
//
//   pnpm --filter @guiexpert/table docs:check          (SHOW=1 prints the failing code)
//
// Each example is compiled on its own, with doc-examples-prelude.ts in front (imports + a few declared
// variables like `tableApi`, `orders`). If the plain block does not compile, it is tried wrapped in a function,
// a class body (EventAdapter / AreaModel / AreaModelObjectArray) or an object literal – examples are often fragments.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "../src");
const prelude = fs.readFileSync(path.join(here, "doc-examples-prelude.ts"), "utf8")
  .replace("__CORE__", path.join(srcDir, "index").replace(/\\/g, "/"));

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? listFiles(path.join(dir, e.name)) : e.name.endsWith(".ts") ? [path.join(dir, e.name)] : []);
}
const inputFiles = process.argv.length > 2 ? process.argv.slice(2) : listFiles(srcDir);

const snips = [];
for (const file of inputFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const line = text.slice(0, m.index).split("\n").length;
    const lines = m[1].split("\n").map(l => l.replace(/^\s*\* ?/, ""));
    // fenced code in the description (before the first block tag)
    const firstTag = lines.findIndex(l => /^\s*@\w/.test(l));
    const desc = (firstTag < 0 ? lines : lines.slice(0, firstTag)).join("\n");
    for (const f of desc.matchAll(/```(ts|typescript)\n([\s\S]*?)```/g)) {
      const code = f[2].split("\n").filter(l => !l.trim().startsWith("import ")).join("\n");
      if (code.trim()) snips.push({ file, line, code, fenced: true });
    }
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim().startsWith("@example")) continue;
      let j = i + 1;
      while (j < lines.length && !/^\s*@\w/.test(lines[j])) j++;
      let code = lines.slice(i + 1, j).join("\n").replace(/^```\w*$/gm, "").trim();
      code = code.split("\n").filter(l => !l.trim().startsWith("import ")).join("\n");
      if (code.trim()) snips.push({ file, line, code });
      i = j - 1;
    }
  }
}

const wrappers = [
  c => `async function __main() {\n${c}\n}`,
  c => c,
  c => `class __X extends EventAdapter {\n${c}\n}`,
  c => `class __Y extends AreaModelObjectArray<Order> {\n${c}\n}`,
  c => `class __Z extends AreaModel {\n${c}\n}`,
  c => `class __W extends AreaModelObjectArray<Order> {\n  __m() {\n${c}\n  }\n}`,
  c => `const __o: Record<string, any> = {\n${c}\n};`,
  c => `const __c = [\n${c}\n];`
];
const options = {
  strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true, noImplicitOverride: true,
  experimentalDecorators: true, lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"]
};
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ge-doc-examples-"));
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

let pending = snips.map((_, k) => k);
const firstErr = {};
const fmt = d => ts.flattenDiagnosticMessageText(d.messageText, "\n").slice(0, 200);
let host;
let oldProgram;
for (const [w, wrap] of wrappers.entries()) {
  if (!pending.length) break;
  const files = {};
  for (const k of pending) {
    const p = path.join(dir, `ex${k}_${w}.ts`);
    fs.writeFileSync(p, `${prelude}\nexport {};\n${wrap(snips[k].code)}\n`);
    files[k] = p;
  }
  const program = ts.createProgram(Object.values(files), options, undefined, oldProgram);
  oldProgram = program;
  const still = [];
  for (const k of pending) {
    const sf = program.getSourceFile(files[k]);
    let diags = program.getSyntacticDiagnostics(sf);
    if (!diags.length) diags = program.getSemanticDiagnostics(sf);
    if (diags.length) {
      still.push(k);
      if (w === 0) firstErr[k] = diags.map(fmt);
    }
  }
  pending = still;
}
console.log(`${snips.length} examples, ${pending.length} failing`);
for (const k of pending) {
  console.log(`--- ${path.relative(process.cwd(), snips[k].file)}:${snips[k].line}`);
  console.log((firstErr[k] ?? []).slice(0, 3).join("\n"));
  if (process.env.SHOW) console.log(snips[k].code.slice(0, 600));
}
fs.rmSync(dir, { recursive: true, force: true });
process.exit(pending.length ? 1 : 0);
