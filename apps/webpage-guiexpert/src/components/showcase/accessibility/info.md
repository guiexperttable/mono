---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [accessibility/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/accessibility/run.astro).

10,000 orders as a **WAI-ARIA grid** – for screen readers and keyboard users, without extra code. The box on the right
shows a copy of what a screen reader announces; switch the language to hear your own texts. Tested with axe-core in CI
(automated checks of the WAI-ARIA grid pattern). MIT-licensed, no dependencies.

```ts title="Give the table a name and your own texts"
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  ariaLabelledBy: "orders-title",            // the visible heading names the grid
  ariaDescribedBy: "orders-hint",            // the key legend describes it
  ariaTexts: {                               // announcements in your language
    sorted: (column, state) => state ? `Sortiert nach ${column}` : "Unsortiert",
    filtered: rowCount => `${rowCount} Zeilen`
  }
};
tableApi.announce("12 new orders arrived");  // your own announcement
```

- **Roles:** `grid` (or `treegrid`), `row`, `columnheader`, `rowheader`, `gridcell` – with the number of **all** rows and
  columns (`aria-rowcount`, `aria-colcount`), not only the 30 in the DOM.
- **Keyboard:** arrows, Home/End, Ctrl+Home/End, Page ↑/↓, ↑ in the first row moves into the header, Enter sorts, Space
  selects, Ctrl+A, Ctrl+C, F2 edits. The table is **one** tab stop.
- **Announcements:** sorting, filtering (“214 rows”), selection, copying – through one live region.
- **Your renderers:** decoration `aria-hidden`, buttons in cells `tabindex="-1"` – rules in
  [instructions.md 6.14](https://github.com/guiexperttable/mono/blob/main/instructions.md).

Training: [chapter 35 – accessibility](/training/accessibility/) · API:
[TableOptionsIf.ariaLabelledBy](/api/interfaces/TableOptionsIf.html#ariaLabelledBy), [AriaTextsIf](/api/interfaces/AriaTextsIf.html),
[TableApi.announce](/api/classes/TableApi.html#announce).
