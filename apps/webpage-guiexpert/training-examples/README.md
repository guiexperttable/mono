# Examples (display only)

Copies of the framework demos of the step-by-step repository
(https://github.com/krocon/guiexpert-table-step-by-step-demo, tag `ep-034`, folder `frameworks/`).
The training pages show them with `<Snippet file="examples/…" />`; they are **not** compiled by the website.
Update them together with the demo repository.

This folder lies outside `src/` on purpose: Astro's dev dependency scan covers `src/**`, and react, vue,
svelte, solid-js, preact and the `@guiexpert/*-table` wrappers are not dependencies of this website.

`home/` holds the short examples of the home page tabs ("Get started"). They were type-checked against the published
1.1.90 packages (tsc for React, Angular, Web Component and TypeScript, vue-tsc for Vue, svelte-check for Svelte).
