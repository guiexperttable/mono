# Angular build harnesses

`ng14` … `ng22` compile the **shared** source in `../packages/angular-table/src` – do not edit `ngNN/lib/src`
(generated, git-ignored).

| File | Purpose |
|---|---|
| `ngNN/package.json` | workspace package `angular-build-ngNN`: Angular/TypeScript/ng-packagr versions for Angular NN, scripts `sync`, `build`, `npm-pub` |
| `ngNN/tsconfig.json` | compiler options for this Angular version (`moduleResolution`, `baseUrl` for ng14–21); maps `@guiexpert/table` to `packages/table/dist` |
| `ngNN/lib/package.json` | the published manifest `@guiexpert/angular-table@NN.x.y` (peer dependencies!) |
| `ngNN/lib/ng-package.json`, `lib/tsconfig.lib*.json` | ng-packagr configuration |
| `ngNN/overrides/` (optional) | version-specific files copied over the shared source |
| `ng22/test/`, `ng22/vitest.config.ts` | tests of the Angular wrapper (Angular 22, the built `dist/`, Chromium) – `pnpm test:angular` |

**Code for newer majors only** (since 1.1.100): keep it in the shared source and mark it – `scripts/sync-angular-src.mjs`
reads the major from the target name (`ng22` → 22):

- a file whose **first line** is `// @since-angular 22` is copied only for Angular 22 and later
  (`packages/angular-table/src/lib/table-signal.component.ts`);
- a line **ending** with `// @since-angular 22` is removed for older majors
  (`export * from './lib/table-signal.component'; // @since-angular 22` in `public-api.ts`).

Everything else is copied byte for byte, so the packages for older majors do not change.

Build: `pnpm build:core` once, then `pnpm build:angular` (all) or `pnpm build:angular:ng22`.
Publish (only on purpose!): `pnpm --filter angular-build-ng22 npm-pub` – tag `latest` for the newest major,
`aNN` for older ones.

Adding Angular 23: copy `ng22` to `ng23`, bump the Angular/TypeScript/ng-packagr versions and the peer dependencies
in `lib/package.json`, set the new version (`23.x.y`), move the `latest` tag from ng22 (→ `a22`) to ng23 and add
`build:angular:ng23` to the root `package.json`. Everything marked `@since-angular 22` is included automatically.
The tests run in the newest major: move `test/`, `vitest.config.ts`, `tsconfig.spec.json` and the test scripts and
devDependencies from ng22 to ng23, and point `test:angular` and the CI filter (`test-wrappers.yml`) to `angular-build-ng23`.
