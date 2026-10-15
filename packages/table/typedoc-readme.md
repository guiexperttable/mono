# GuiExpert Table – API reference

`@guiexpert/table` is the framework-free core of the GuiExpert Table: virtual scrolling in both directions,
millions of rows, zero runtime dependencies, MIT-licensed. The framework packages (Angular, React, Vue,
Svelte, Solid, Preact, Web Component) are thin wrappers around exactly this API.

**New here?** The [training](https://gui.expert/training/) explains everything step by step – 36 short
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
| update cells live | [TableApi.updateCells](classes/TableApi.html#updateCells), [TableCellUpdateEvent](classes/TableCellUpdateEvent.html) | [Live data](https://gui.expert/training/live-data/) |
| remember sorting and scroll position | [AutoRestoreOptions](classes/AutoRestoreOptions.html) | [Persist state](https://gui.expert/training/persist-state/) |

The index is grouped by topic: **Table & API**, **Table model**, **Area models**, **Columns**, **Options**,
**Header groups**, **Tree & checkboxes**, **Renderers & editing**, **Events**, **Selection & focus**,
**Sorting & filtering**, **Export & clipboard**, **Styling**, **Keyboard**, **Aggregation**, **Row grouping**, **DOM**,
**CRUD**, **Utilities** –
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
Showcases: [gui.expert/showcase](https://gui.expert/showcase/) · Licence: MIT
