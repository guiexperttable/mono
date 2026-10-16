---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [rtl/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/rtl/run.astro).

Model: [createRtlCitiesModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createRtlCitiesModel.ts).

Monthly sales of 2,000 branches in Arabic cities. **One option mirrors the whole table** for Arabic, Hebrew, Persian and
Urdu: the first column is on the right, horizontal scrolling starts on the right, the city stays fixed at the start
(right), the total at the end (left). Switch to `ltr` to compare – same model, same code. MIT-licensed, no
dependencies.

```ts title="Right-to-left"
const tableModel = TableFactory.createTableModel({
  rows,                                      // [{ city: "الرياض", country: "السعودية", m1: 15433, … }]
  properties: ["city", "country", "m1", "m2", "m3"],
  fixedLeftColumnCount: 1                    // "left" = start: the city stays on the RIGHT
});
const tableOptions = { ...new TableOptions(), direction: "rtl" };   // or "auto": from <html dir="rtl">
```

- **Everything mirrored:** header groups, row numbers, tree indent, sort icons, the column resize handle (on the left
  edge), the fill handle, row drag, master/detail and the total row.
- **Arrow keys in reading direction:** → moves to the previous column (on the right), ← to the next.
- **Excel:** the export is a right-to-left sheet – column A on the right, like in the table.
- **Mixed text** ("فرع RUH-01") and numbers are shown by the browser's bidi algorithm – nothing to configure.
- **Left-to-right is unchanged** – pixel for pixel. "Left" and "right" in option names mean start and end.

Docs: [instructions.md 6.19](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[TableOptionsIf.direction](/api/interfaces/TableOptionsIf.html#direction), [TableApi.getDirection](/api/classes/TableApi.html#getDirection).
