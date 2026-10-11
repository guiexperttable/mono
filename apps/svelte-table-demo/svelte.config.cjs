// Svelte 5 understands TypeScript in <script lang="ts"> natively – no script preprocessor needed.
// (svelte-preprocess removed imports that are only used in the template → "GuiexpertTable is not defined".)
// For <style lang="scss"> etc. add vitePreprocess from @sveltejs/vite-plugin-svelte in an ESM config.
module.exports = {};
