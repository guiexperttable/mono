
# SvelteTable (GuiExpert Table)

This is the Svelte component of the GuiExpert Table Project.

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
- Accessibility support: Keyboard Shortcuts
- Custom Filtering
- In-place Cell Editing
- Userdefined Key and Mouse Events
- Customizable Look & Feel (via CSS variables)
- Row sorting
- Column Reordering (Drag and Drop)
- State Persistence (Row Sorting, Column Order, Selection)
- Customizable Cell Contents via Renderer for Header, Body and Footer
- Full control over the HTML structure and style


### New in October 2026 (1.1.91 – 1.1.98) – all MIT-licensed

- Screen readers and keyboard: WAI-ARIA grid, announcements, full keyboard navigation (1.1.91)
- “Loading…” and “No rows” overlays with a CSS spinner, `loading` prop (1.1.92)
- Save and restore the state: column layout, sorting, scroll position, selection – localStorage or your server (1.1.92)
- Row numbers like in a spreadsheet: `rowNumbersVisible: true` (1.1.93)
- Total rows that follow the filter, sums of the selection: `footerAggregates` (1.1.94)
- Row grouping with subtotals: `RowGroupFactory` (1.1.94)
- Pivot tables: `PivotFactory` (1.1.94)
- Calculated columns, “Show values as” and formulas without `eval`: `valueGetter`, `showValuesAs`, `formula` (1.1.95)
- Drag rows into order – mouse, touch, keyboard: `rowDrag: true` (1.1.95)
- Fill handle and batch edit: `fillHandle`, `batchEdit` (1.1.96)
- Master/detail with nested tables or components: `masterDetail` (1.1.97)
- Right-to-left for Arabic, Hebrew, Persian: `direction: "rtl"` (1.1.98)

All twelve with code and live demos: [gui.expert/whats-new](https://gui.expert/whats-new/) ·
training: [gui.expert/training](https://gui.expert/training/)

## Links

- [Demos](https://gui.expert/demos)
- [Documentation](https://gui.expert/doc)
- [API](https://gui.expert/api)

## Get Started

Add the following two NPM packages to your existing Svelte project (run this in your project root directory):

```
npm install --save @guiexpert/table @guiexpert/svelte-table
```

Works with **Svelte 4 and Svelte 5**: the package ships the component as Svelte source, which is compiled by your
own Svelte compiler (no preprocessor needed).

Add GuiexpertTable component to a template – Svelte 4 / legacy syntax:

```
<GuiexpertTable
  on:mouseClicked={handleMouseClicked}
  on:tableReady={handleTableReady}
  tableModel={tableModel}
  tableOptions={tableOptions}
/>
```

Svelte 5 (runes mode) – use the callback props (payload directly, no `e.detail`):

```
<GuiexpertTable
  {tableModel}
  {tableOptions}
  onTableReady={(api) => tableApi = api}
  onMouseClicked={(evt) => console.info(evt.rowIndex, evt.columnIndex)}
/>
```

Callback props: `onTableReady`, `onMouseClicked`, `onMouseMoved`, `onMouseDragging`, `onMouseDraggingEnd`,
`onContextmenu`, `onCheckboxChanged`, `onModelChanged`, `onSelectionChanged`, `onFocusChanged`, `onScroll`
(the same names without `on` are dispatched as Svelte events). A new `tableModel` / `tableOptions` object
re-creates the table. Svelte components as cell renderers: `new ComponentRendererWrapper(MyCell)`.

Import the following classes in your component:
```
<script lang="ts">

import { GuiexpertTable } from "@guiexpert/svelte-table";
import {
  GeMouseEvent,
  TableApi,
  TableFactory,
  TableModelIf,
  TableOptions,
  TableOptionsIf
} from "@guiexpert/table";
```


Add a tableModel property and a onTableReady method to the component:

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

function onTableReady(api: TableApi) {
  console.info("onTableReady API:", api);
}
```

There are numerous possibilities to create table models.
Please refer to the [Documentation](https://gui.expert/doc) for further information or the [Demo](https://gui.expert/demos) section for examples.




## License

**Current releases: MIT License.** All currently published versions are free to use, modify and distribute – also in commercial and proprietary applications. See [LICENSE](https://github.com/guiexperttable/mono/blob/main/LICENSE).

**Future releases: possible dual licensing.** Dr. Marc Kronberg (gui.expert) reserves the right to publish future versions under different terms (e.g. open source for individuals and non-commercial use, commercial license for businesses). Versions already released under MIT remain MIT. Details: [gui.expert/license](https://gui.expert/license/).
