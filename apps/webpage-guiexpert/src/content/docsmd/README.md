GuiExpert Table API / [Exports](modules.md)

# GuiExpert Table – API reference

`@guiexpert/table` is the framework-free core of the GuiExpert Table: virtual scrolling in both directions,
millions of rows, zero runtime dependencies, MIT-licensed. The framework packages (Angular, React, Vue,
Svelte, Solid, Preact, Web Component) are thin wrappers around exactly this API.

**New here?** The [training](https://gui.expert/training/) explains everything step by step – 39 short
chapters with live demos. Every chapter links back to the classes on this site.

```ts
import "@guiexpert/table/css/main.css";
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

const host = document.querySelector<HTMLDivElement>(".table-div")!;   // needs a height!
const tableModel = TableFactory.createTableModel({ rows: orders });
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
tableScope.firstInit();
const tableApi = tableScope.getApi();
```

## Where to start

| You want to … | Look at | Training |
|---|---|---|
| create and control a table | [TableScope](classes/TableScope.html), [TableApi](classes/TableApi.html) | [First table](https://gui.expert/training/first-table/) |
| turn data into a model | [TableFactory](classes/TableFactory.html), [CreateTableModelPara](interfaces/CreateTableModelPara.html) | [Array&lt;T&gt; → model](https://gui.expert/training/array-to-table-model/) |
| define columns | [ColumnDef](classes/ColumnDef.html), [ColumnDefIf](interfaces/ColumnDefIf.html), [Size](classes/Size.html) | [ColumnDef](https://gui.expert/training/column-definitions/) |
| write an own header, body or footer | [AreaModel](classes/AreaModel.html), [AreaModelIf](interfaces/AreaModelIf.html) | [Own AreaModel](https://gui.expert/training/custom-area-model/), [Footer totals](https://gui.expert/training/footer-totals/) |
| configure behaviour and look | [TableOptions](classes/TableOptions.html), [TableOptionsIf](interfaces/TableOptionsIf.html) | [TableOptions](https://gui.expert/training/table-options/) |
| sort and filter | [TableApi.sortByColumn](classes/TableApi.html#sortByColumn), [TableOptionsIf.externalFilterFunction](interfaces/TableOptionsIf.html#externalFilterFunction) | [Sorting](https://gui.expert/training/sorting/), [Filtering](https://gui.expert/training/filtering/) |
| react to clicks, selection, edits | [EventAdapter](classes/EventAdapter.html), [EventListenerIf](interfaces/EventListenerIf.html), [GeMouseEvent](classes/GeMouseEvent.html) | [Events](https://gui.expert/training/events-and-context-menu/) |
| select and copy | [SelectionModel](classes/SelectionModel.html), [TableApi.copyToClipboard](classes/TableApi.html#copyToClipboard) | [Selection & copy](https://gui.expert/training/selection-and-copy/) |
| export to Excel | [TableApi.downloadExcel](classes/TableApi.html#downloadExcel), [ExcelService](classes/ExcelService.html) | [Excel export](https://gui.expert/training/excel-export/) |
| style cells | [CellRendererIf](interfaces/CellRendererIf.html), [GeCssColorUtil](classes/GeCssColorUtil.html) | [Renderers](https://gui.expert/training/cell-renderers/), [Heatmap](https://gui.expert/training/heatmap/) |
| show a tree | [TreeFactory](classes/TreeFactory.html), [TreeRow](classes/TreeRow.html) | [Tree table](https://gui.expert/training/tree-table/) |
| group flat rows with totals | [RowGroupFactory](classes/RowGroupFactory.html), [AreaModelRowGroups](classes/AreaModelRowGroups.html), [TableApi.setRowGroupBy](classes/TableApi.html#setRowGroupBy) | [Row grouping](https://gui.expert/training/row-grouping/) |
| pivot rows × columns with totals | [PivotFactory](classes/PivotFactory.html), [AreaModelPivot](classes/AreaModelPivot.html), [pivotRows](functions/pivotRows.html), [TableApi.setPivotConfig](classes/TableApi.html#setPivotConfig) | [Pivot tables](https://gui.expert/training/pivot-tables/) |
| update cells live | [TableApi.updateCells](classes/TableApi.html#updateCells), [TableCellUpdateEvent](classes/TableCellUpdateEvent.html) | [Live data](https://gui.expert/training/live-data/) |
| remember layout, sorting, scroll position, selection | [AutoRestoreOptions](classes/AutoRestoreOptions.html), [TableApi.getState](classes/TableApi.html#getState), [TableApi.applyState](classes/TableApi.html#applyState) | [Persist state](https://gui.expert/training/persist-state/) |

## New in October 2026 (1.1.91 – 1.1.98)

Twelve features, all MIT-licensed – overview with code and live demos: [gui.expert/whats-new](https://gui.expert/whats-new/).

| Feature | Start here | Since | Training |
|---|---|---|---|
| Screen readers & keyboard (WAI-ARIA grid) | [TableOptionsIf.ariaLabelledBy](interfaces/TableOptionsIf.html#ariaLabelledBy), [AriaTextsIf](interfaces/AriaTextsIf.html), [TableApi.announce](classes/TableApi.html#announce) | 1.1.91 | [Accessibility](https://gui.expert/training/accessibility/) |
| “Loading…” and “No rows” overlays | [TableApi.showLoadingOverlay](classes/TableApi.html#showLoadingOverlay), [OverlayOptionsIf](interfaces/OverlayOptionsIf.html) | 1.1.92 | [Live data](https://gui.expert/training/live-data/#overlays) |
| Save & restore the state | [TableApi.getState](classes/TableApi.html#getState), [TableStateIf](interfaces/TableStateIf.html), [EventListenerIf.onStateChanged](interfaces/EventListenerIf.html#onStateChanged) | 1.1.92 | [Persist state](https://gui.expert/training/persist-state/) |
| Row numbers | [CreateTableModelPara.rowNumbersVisible](interfaces/CreateTableModelPara.html#rowNumbersVisible), [RowNumberColumnDef](classes/RowNumberColumnDef.html) | 1.1.93 | [Fixed columns](https://gui.expert/training/fixed-columns/#row-numbers) |
| Total rows, sum of the selection | [CreateTableModelPara.footerAggregates](interfaces/CreateTableModelPara.html#footerAggregates), [Aggregators](variables/Aggregators.html), [TableApi.getSelectionAggregates](classes/TableApi.html#getSelectionAggregates) | 1.1.94 | [Footer totals](https://gui.expert/training/footer-totals/#built-in) |
| Row grouping | [RowGroupFactory](classes/RowGroupFactory.html), [TableApi.setRowGroupBy](classes/TableApi.html#setRowGroupBy) | 1.1.94 | [Row grouping](https://gui.expert/training/row-grouping/) |
| Pivot tables | [PivotFactory](classes/PivotFactory.html), [TableApi.setPivotConfig](classes/TableApi.html#setPivotConfig) | 1.1.94 | [Pivot tables](https://gui.expert/training/pivot-tables/) |
| Calculated columns, “Show values as”, formulas | [ColumnDefIf.valueGetter](interfaces/ColumnDefIf.html#valueGetter), [ColumnDefIf.showValuesAs](interfaces/ColumnDefIf.html#showValuesAs), [compileFormula](functions/compileFormula.html), [TableApi.setColumnFormula](classes/TableApi.html#setColumnFormula) | 1.1.95 | [Formulas](https://gui.expert/training/formulas/) |
| Drag rows into order | [CreateTableModelPara.rowDrag](interfaces/CreateTableModelPara.html#rowDrag), [GeRowDragEvent](classes/GeRowDragEvent.html), [TableApi.moveRows](classes/TableApi.html#moveRows) | 1.1.95 | [Events](https://gui.expert/training/events-and-context-menu/#row-drag) |
| Fill handle & batch edit | [TableOptionsIf.fillHandle](interfaces/TableOptionsIf.html#fillHandle), [TableOptionsIf.batchEdit](interfaces/TableOptionsIf.html#batchEdit), [TableApi.commitBatchEdit](classes/TableApi.html#commitBatchEdit) | 1.1.96 | [Inline editing](https://gui.expert/training/inline-editing/#fill-batch) |
| Master/detail | [TableOptionsIf.masterDetail](interfaces/TableOptionsIf.html#masterDetail), [DetailRenderContextIf](interfaces/DetailRenderContextIf.html) | 1.1.97 | [Master/detail](https://gui.expert/training/master-detail/) |
| Right-to-left | [TableOptionsIf.direction](interfaces/TableOptionsIf.html#direction), [TableApi.getDirection](classes/TableApi.html#getDirection) | 1.1.98 | [Theming](https://gui.expert/training/theming-dark-mode/#rtl) |

The index is grouped by topic: **Table & API**, **Table model**, **Area models**, **Columns**, **Options**,
**Header groups**, **Tree & checkboxes**, **Renderers & editing**, **Events**, **Selection & focus**,
**Sorting & filtering**, **Export & clipboard**, **Styling**, **Keyboard**, **Accessibility**, **Overlays**, **State**,
**Row numbers**, **Aggregation**, **Row grouping**, **Pivot**, **Calculated columns & formulas**, **Row drag**,
**Fill handle & batch edit**, **Master/detail**, **DOM**, **CRUD**, **Utilities** –
and **Internals** for the classes the table uses itself.

## Packages

| Package | Use |
|---|---|
| `@guiexpert/table` | the core – this API |
| `@guiexpert/angular-table@NN` | Angular 14–22 (major = Angular major) |
| `@guiexpert/react-table`, `@guiexpert/preact-table`, `@guiexpert/solid-table` | callback props `tableReady`, `mouseClicked` … |
| `@guiexpert/vue3-table` | Vue events `@tableReady`, `@mouseClicked` … |
| `@guiexpert/svelte-table` | Svelte 4 and 5 |
| `@guiexpert/webcomponent-table` | `<guiexpert-table>` for any page |

Source code: [github.com/guiexperttable/mono](https://github.com/guiexperttable/mono) ·
Showcases: [gui.expert/showcase](https://gui.expert/showcase/) · What's new: [gui.expert/whats-new](https://gui.expert/whats-new/) · Licence: MIT
