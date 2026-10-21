// Angular 22 demo of TableSignalComponent – Vite + JIT, no Angular CLI.
//
//   pnpm build:core && pnpm build:angular:ng22      (once – the demo uses the BUILT packages)
//   pnpm serve:angular-signal-demo                  → http://localhost:4210
//
// Why JIT and Vite: the Angular CLI (@angular/build) would add Vite 7 and further peer variants to the lockfile.
// The library itself is the real, partially compiled package from angular-builds/ng22/dist; the demo components are
// compiled in the browser (`import "@angular/compiler"` first in main.ts). Fine for trying it out and for recordings,
// not a template for production builds (those use the Angular CLI with AOT).
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/angular-signal-demo",
  server: { port: 4210, host: "localhost" },
  preview: { port: 4310, host: "localhost" },
  // decorators of the demo components (JIT)
  esbuild: { tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } } },
  resolve: {
    // one Angular: the linked package (angular-builds/ng22/dist) would otherwise resolve @angular/* from
    // angular-builds/ng22/node_modules – a second copy (see CLAUDE.md §2, angular-table-demo)
    dedupe: ["@angular/core", "@angular/common", "@angular/compiler", "@angular/platform-browser", "@guiexpert/table"],
  },
  optimizeDeps: {
    include: ["@angular/core", "@angular/common", "@angular/compiler", "@angular/platform-browser"],
  },
});
