---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [covergrid/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/covergrid/run.astro).

Model, books and renderer: [createCoverGridModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createCoverGridModel.ts).

Not every list is a table: book covers, photos, products, videos. A **cover grid** shows your items as tiles – as
many per row as fit into the width. It is a GuiExpert Table with a different table model, so it keeps what the
table is good at: only the visible rows are in the DOM (10,000 books here, 1 million work too), filter, sort and
the scroll position are built in. MIT-licensed, no dependencies.

```ts title="Books as tiles"
const tableModel = CoverGridFactory.createCoverGridModel(books, new BookCoverRenderer(), 160, 260);
const tableOptions = {
  ...CoverGridFactory.createCoverGrisDefaultOptions(260, () => "books"),   // no borders, no hover
  externalFilterFunction: (book: Book) => book.title.toLowerCase().includes(searchText),
};
const tableApi = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener)
  .firstInit().getApi();
listener.onMouseClicked = evt => {
  const book = tableModel.bodyModel.getValueAt(evt.rowIndex, evt.columnIndex);   // the tile under the mouse
};
```

- **Columns follow the width:** `floor(width / coverWidth)` – the table measures its host, you do nothing.
  To fill the width exactly, make the tiles a bit wider (`fitCoversToWidth` in the demo model).
- **Size without a new model:** `tableModel.bodyModel.coverWidth = 220; …coverHeight = 340; tableApi.repaintHard()`.
- **Filter and sort:** `tableApi.externalFilterChanged()` and `tableApi.sort((a, b) => …)` – the order survives the
  filter.
- **Renderer:** a plain `CellRendererIf` gets the cell `<div>` and the item – draw an `<img>`, a title, a progress
  bar. Set user data as text (`textContent`), never as HTML.

Docs: [instructions.md 5.10](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[CoverGridFactory](/api/classes/CoverGridFactory.html), [CoverGridTableModel](/api/classes/CoverGridTableModel.html),
[CoverGridBodyModel](/api/classes/CoverGridBodyModel.html).
