---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [batchedit/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/batchedit/run.astro).

Model: [createPriceListModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createPriceListModel.ts).

A price list you edit like a spreadsheet: select cells and drag the small square at the bottom right corner – one
value is copied, two numbers continue as a series (10, 20 → 30, 40), dates count up, `Item 9` becomes `Item 10`.
⌥/Alt switches between series and copy, Ctrl/⌘+D fills down. All changes are **collected** and marked – your data
stays as it is until you press *Save* (or *Discard*). MIT-licensed, no dependencies.

```ts title="Fill handle + batch edit"
const selectionModel = new SelectionModel("range", "multi");
const tableOptions = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel,
  fillHandle: true,      // the square at the corner of the selection
  batchEdit: true,       // collect changes until "Save"
};
saveButton.onclick = async () => {
  await fetch("/api/prices", { method: "PATCH", body: JSON.stringify(tableApi.getPendingChanges()) });
  tableApi.commitBatchEdit();
};
discardButton.onclick = () => tableApi.cancelBatchEdit();
```

- **Validation:** `ColumnDef.validate` – a negative price or a discount above 50 % is marked red, the message is the
  tooltip, *Save* stays disabled.
- **Sorting and filtering** keep the changes on their rows (they belong to the row objects, not to positions).
- **Only editable cells** are filled – *SKU* and the calculated *Net* column are skipped.
- **Events:** `onBatchEditChanged` (enable *Save*), `onModelChanged` once per change with old and new values.

Docs: [instructions.md 6.17](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[TableApi.commitBatchEdit](/api/classes/TableApi.html#commitBatchEdit), [TableApi.fillRange](/api/classes/TableApi.html#fillRange).
