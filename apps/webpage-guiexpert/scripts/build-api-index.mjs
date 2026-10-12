// Builds src/training/api-index.json from the typedoc JSON of @guiexpert/table.
//
//   node scripts/build-api-index.mjs [path/to/doctype.json]
//
// Default input: ../table-website/src/assets/json/doctype.json (written by `pnpm --filter @guiexpert/table typedoc:json`).
// The training pages link API symbols via <ApiLink name="TableApi.sortByColumn" />; ApiLink looks the name up
// in this index and fails the build for unknown names – so a renamed method can never leave a dead link behind.
import { readFileSync, writeFileSync } from "node:fs";

const input = process.argv[2] ?? "../table-website/src/assets/json/doctype.json";
const output = "src/training/api-index.json";

const FOLDER = { 128: "classes", 256: "interfaces", 2097152: "types", 64: "functions", 32: "variables", 8: "enums" };
const KIND = { 128: "class", 256: "interface", 2097152: "type", 64: "function", 32: "variable", 8: "enum" };
const MEMBER = { 512: "constructor", 1024: "property", 2048: "method", 262144: "accessor", 16: "enum member" };

const project = JSON.parse(readFileSync(input, "utf8"));
const index = {};
for (const symbol of project.children ?? []) {
  const folder = FOLDER[symbol.kind];
  if (!folder) continue;
  const url = `/api/${folder}/${symbol.name}.html`;
  index[symbol.name] = { url, kind: KIND[symbol.kind] };
  for (const member of symbol.children ?? []) {
    if (!MEMBER[member.kind]) continue;
    index[`${symbol.name}.${member.name}`] = { url: `${url}#${member.name}`, kind: MEMBER[member.kind] };
  }
  // type aliases of object types (e.g. CreateTableModelPara): their properties live in symbol.type.declaration
  for (const member of symbol.type?.declaration?.children ?? []) {
    index[`${symbol.name}.${member.name}`] = { url, kind: "property" };   // typedoc renders them inline, without anchors
  }
}
writeFileSync(output, JSON.stringify(index, null, 0).replace(/},"/g, '},\n"') + "\n");
console.log(`${Object.keys(index).length} API symbols → ${output}`);
