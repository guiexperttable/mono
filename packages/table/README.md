
# GuiExpert Table with plain JS

This is the base component of the GuiExpert Table Project. One can use this in a plain JS project.

## Become a master at creating web applications with large tables

This is the UI-agnostic table component for your next web app. 😊

<img src="https://raw.githubusercontent.com/guiexperttable/mono/main/apps/webpage-guiexpert/src/assets/screens/heatmap.png" width="50%">

### Features
- Handle large datasets easily
- Excellent performance for large tables by vertical and horizontal virtual scrolling
- Fully-featured (advanced sorting and filtering)
- Highly customizable orderData grid
- Outstanding performance
- No third-party dependencies
- UI-agnostic
- Column Interactions (resize, reorder)
- Sorting Rows
- Row, Column, and Range Selection
- Single and Multi Selection
- UI-agnostic
- Row and Column Spanning
- Fixed Columns (Left and Right)
- Tree table (Hierarchical View)
- Accessibility: screen readers (WAI-ARIA grid/treegrid, row/column counts with virtual scrolling, announcements of
  sorting, filter and copy) and full keyboard navigation (arrows, Home/End, Page Up/Down, header focus, Enter) – since 1.1.91
- Overlays "Loading…" (CSS spinner, `tableApi.showLoadingOverlay()`, `loading` prop in the wrappers) and
  "No rows to show" / "No matching rows" (automatic) – plain HTML/CSS, since 1.1.92
- Row numbers like in a spreadsheet (`rowNumbersVisible: true` or `RowNumberColumnDef`): fixed on the left, width
  fits the largest number, click selects the row, view or original order – since 1.1.93
- Aggregation: total rows in the footer that follow filter and sorting (`footerAggregates: { quantity: "sum", total: "avg" }`,
  `AreaModelAggregateFooter`), helpers `aggregate()` / `aggregateColumns()` with mergeable aggregators (sum, count, avg,
  min, max, countDistinct, first, last or your own), and count/sum/average of the selected cells for a status bar
  (`tableApi.getSelectionAggregates()`) – since 1.1.94
- Row grouping with aggregation: flat rows grouped by one or more properties or functions, group rows with arrow,
  label (`"Berlin (12)"`) and sum/average/… per column, total row, filter and sorting by aggregate, regroup at runtime
  (`RowGroupFactory.createTableModel({ rows, groupBy, aggregations })`, `tableApi.setRowGroupBy()`) – since 1.1.94
- Pivot tables: row fields (a hierarchy with subtotals) × column fields (their values become columns, several fields
  = a multi-row header with collapsible groups) × aggregated values, total column and total row, filter before the
  aggregation, pivot again at runtime (`PivotFactory.createTableModel({ rows, rowFields, columnFields, values })`,
  `tableApi.setPivotConfig()`, engine `pivotRows()`) – since 1.1.94
- Calculated columns (`ColumnDef.valueGetter` – sorting, filter via `tableApi.getRowValue()`, copy, Excel, totals and
  row grouping use the computed value), „Show values as“ (`showValuesAs`: share of the column / row / grand / parent
  total, running total, difference, rank – also per pivot value) and formulas (`formula: "[price] * [quantity] * 1.19"`,
  own parser and interpreter without `eval`, functions like `ROUND`, `IF`, `SUM([x])`, error values `#DIV/0!`,
  `tableApi.setColumnFormula()`) – since 1.1.95
- Row drag: drag handle per row (`ColumnDef.rowDrag` or `rowDrag: true` in the factory), mouse, touch and pen, ghost,
  drop marker, auto-scroll, Escape, keyboard alternative Ctrl+Alt+↑/↓, several selected rows, trees; the table moves
  the rows (managed) or only reports the drop (`rowDragOptions: { managed: false }`, `onRowDragEnd`) – since 1.1.95
- Custom Filtering
- In-place Cell Editing
- Userdefined Key and Mouse Events
- Customizable Look & Feel (via CSS variables)
- Row sorting
- Column Reordering (Drag and Drop)
- State persistence: column layout (width, order, visibility), sorting, scroll position, tree, checked and selected
  rows, header groups – in `localStorage` (`autoRestoreOptions`) or on your server (`tableApi.getState()` /
  `applyState()`, `initialState`, `onStateChanged`); stored by property and row id, never by index – since 1.1.92
- Customizable Cell Contents via Renderer for Header, Body and Footer
- Full control over the HTML structure and style


## Links

- [Training: GuiExpert Table step by step](https://gui.expert/training/)
- [Demos](https://gui.expert/demos)
- [Documentation](https://gui.expert/doc)
- [API](https://gui.expert/api)

## Get Started

Add the following NPM package to your existing plain JS project (run this in your project root directory):

```
npm install --save @guiexpert/table
```

Add an empty <div> element to your html code:

```
<div
    class="container-div"
    style="width:100%;height:100%;background:transparent;margin:0;padding:0;"
    ></div>
```

If you are working with plain JS, you don't need to do this. If you are using TypeScript as a language, please import the following classes:
```
import {
  EventAdapter,
  SimpleDomService,
  TableModelIf,
  TableOptions,
  TableScope } from "@guiexpert/table";
```


Create a table model.
Select ('querySelector') the <div> element and create a table scope.
Finally, call firstInit() at least once.
In this example, you will see the plain TS version. For plain JS, remove ': TableModelIf'.

```
const tableModel: TableModelIf = TableFactory.createTableModel({
  headerData: [
    ['Header 1', 'Header 2']
  ],
  bodyData: [
    ['Text 1a', 'Text 2a'],
    ['Text 1b', 'Text 2b'],
  ]
});  

const ele = document.querySelector(".container-div") as HTMLDivElement;

const tableScope = new TableScope(
  ele, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter()
);
tableScope.firstInit();
```

There are numerous possibilities to create table models.
Please refer to the [Documentation](https://gui.expert/doc) for further information or the [Demo](https://gui.expert/demos) section for examples.



## License

**Current releases: MIT License.** All currently published versions are free to use, modify and distribute – also in commercial and proprietary applications. See [LICENSE](https://github.com/guiexperttable/mono/blob/main/LICENSE).

**Future releases: possible dual licensing.** Dr. Marc Kronberg (gui.expert) reserves the right to publish future versions under different terms (e.g. open source for individuals and non-commercial use, commercial license for businesses). Versions already released under MIT remain MIT. Details: [gui.expert/license](https://gui.expert/license/).
