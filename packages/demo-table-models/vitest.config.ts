// Unit tests of the demo models (Node, since 1.1.116 – prompt 025): the core from its sources, like the core specs.
import { defineConfig } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    environment: "node",
  },
  resolve: {
    alias: [{ find: /^@guiexpert\/table$/, replacement: join(__dirname, "..", "table", "src", "index.ts") }],
  },
});
