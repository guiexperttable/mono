---
layout: ../../layouts/GetStartedLayout.astro
---

# Stackblitz

You can find it on stackblitz:
<a href="https://stackblitz.com/edit/stackblitz-guiexpert-svelte-demo?file=README.md" target="_blank">stackblitz-guiexpert-svelte-demo</a>.


# Installation

Add the following NPM package to your existing Svelte project
(run this in your project root directory):

```shell
npm install --save @guiexpert/table @guiexpert/svelte-table
```


## Add global table CSS

To add the global guiexpert CSS file in your Svelte project, 
you can include the file in the header of the `index.html` file:

```html
<link href="https://cdn.jsdelivr.net/npm/@guiexpert/table/css/main.css" rel="stylesheet" />
```

You will also find the `main.css` in the downloaded node module: `node_modules/@guiexpert/table/css/main.css`.


# Create an example component

The package ships the component as Svelte source – it runs under Svelte 4 and Svelte 5.
Create the model once (not in a reactive statement): a new model rebuilds the table.

```svelte title="App.svelte (Svelte 5)"
<script lang="ts">
  import { GuiexpertTable } from "@guiexpert/svelte-table";
  import { TableFactory, TableOptions, type TableApi } from "@guiexpert/table";

  const rows = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}`, price: i % 100 }));
  const tableModel = TableFactory.createTableModel({ rows, properties: ["id", "name", "price"] });
  const tableOptions = { ...new TableOptions() };
  let info = $state("");
</script>

<div class="table-div">
  <GuiexpertTable
    {tableModel}
    {tableOptions}
    onTableReady={(api: TableApi) => (info = `${api.getBodyModel().getRowCount()} rows`)}
  />
</div>
<p>{info}</p>

<style>
  .table-div { height: 500px; }
</style>
```

Svelte 4: use the events instead of the callback props – `on:tableReady={e => …}` (the payload is in `e.detail`).

Be sure, that your div containers expands. Add this CSS rule to your component's style.

```css
html,
body,
#root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
```

