[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableOptionsIf

# Interface: TableOptionsIf

Represents the options for configuring a table.

| Class Property                   | Description                                                                                   |
|----------------------------------|-----------------------------------------------------------------------------------------------|
| headerSeparatorBorderVisible     | Indicates whether the header separator border is visible.                                      |
| footerSeparatorBorderVisible     | Indicates whether the footer separator border is visible or not.                                |
| fixedEastSeparatorBorderVisible  | Determines whether the fixed east separator border is visible.                                  |
| fixedWestSeparatorBorderVisible  | Indicates whether the fixed west separator border should be visible.                            |
| verticalBorderVisible            | Indicates whether the vertical border is visible.                                               |
| horizontalBorderVisible          | Represents the visibility of the horizontal border.                                             |
| overflowX                        | Determines the behavior of horizontal overflow for the table body (scroll port).               |
| overflowY                        | Determines the behavior of vertical overflow for the table body (scroll port).                 |
| tableTopBorderVisible            | Indicates whether the top border of a table is visible or hidden.                                |
| tableBottomBorderVisible         | Specifies whether the bottom border of a table is visible.                                       |
| hoverRowVisible                  | Flag indicating whether the hover color of a row is visible or not in general.                  |
| hoverColumnVisible               | Flag indicating whether the hover color of a column is visible or not in general.               |
| columnsResizable                 | Represents whether the columns are resizable.                                                    |
| columnsDraggable                 | Flag indicating whether the columns are draggable.                                               |
| columnResizeHandleWidthInPx      | The width of the column resize handle in pixels.                                                 |
| headerVerticalSeparator          | Represents whether a vertical separator should be displayed in a header.                        |
| footerVerticalSeparator          | Indicates whether a vertical separator should be displayed in the footer.                       |
| defaultRowHeights                | Represents the default row heights for a given table.                                            |
| headerToggleExpandCollapseIcons  | Indicates whether to show toggle icons in the header.                                            |
| treeOptions                      | Represents the options for configuring a tree.                                                   |
| headerGroupOptions               | Represents the options for expnded/collapsed icons of the header groups.                                                   |
| showCheckboxWihoutExtraColumn    | Indicates whether to show checkbox without an extra column.                                       |
| externalFilterFunction           | Represents the external filter function used to filter table rows.                                |
| sortedOptions                    | Represents a sorted options object.                                                              |
| sortOrder                        | Represents the sort order of the columns.                                                        |
| autoRestoreOptions               | Represents auto restoration options.                                                             |
| getEditRenderer                  | Retrieves the edit renderer for a specific action.                                                |
| getSelectionModel                | Retrieves the selection model for a specific object.                                              |
| getFocusModel                    | Retrieves the focus model of the component.                                                       |
| shortcutActionIdMapping          | Represents a mapping of shortcut action IDs.                                                     |

Start from the defaults in [TableOptions](../classes/TableOptions.md) and change only what you need.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  hoverColumnVisible: false,
  columnsDraggable: false,
  defaultRowHeights: { header: 40, body: 30, footer: 36 }
};
```

**`See`**

Training: [TableOptions: behaviour and look](https://gui.expert/training/table-options/)

## Implemented by

- [`TableOptions`](../classes/TableOptions.md)

## Table of contents

### Properties

- [ariaDescribedBy](TableOptionsIf.md#ariadescribedby)
- [ariaLabel](TableOptionsIf.md#arialabel)
- [ariaLabelledBy](TableOptionsIf.md#arialabelledby)
- [ariaTexts](TableOptionsIf.md#ariatexts)
- [autoRestoreOptions](TableOptionsIf.md#autorestoreoptions)
- [batchEdit](TableOptionsIf.md#batchedit)
- [cellFormulas](TableOptionsIf.md#cellformulas)
- [clipboard](TableOptionsIf.md#clipboard)
- [columnResizeHandleWidthInPx](TableOptionsIf.md#columnresizehandlewidthinpx)
- [columnsDraggable](TableOptionsIf.md#columnsdraggable)
- [columnsResizable](TableOptionsIf.md#columnsresizable)
- [defaultRowHeights](TableOptionsIf.md#defaultrowheights)
- [direction](TableOptionsIf.md#direction)
- [editing](TableOptionsIf.md#editing)
- [externalFilterFunction](TableOptionsIf.md#externalfilterfunction)
- [fillHandle](TableOptionsIf.md#fillhandle)
- [fixedEastSeparatorBorderVisible](TableOptionsIf.md#fixedeastseparatorbordervisible)
- [fixedWestSeparatorBorderVisible](TableOptionsIf.md#fixedwestseparatorbordervisible)
- [footerSeparatorBorderVisible](TableOptionsIf.md#footerseparatorbordervisible)
- [footerVerticalSeparator](TableOptionsIf.md#footerverticalseparator)
- [getEditRenderer](TableOptionsIf.md#geteditrenderer)
- [getFocusModel](TableOptionsIf.md#getfocusmodel)
- [getSelectionModel](TableOptionsIf.md#getselectionmodel)
- [headerGroupOptions](TableOptionsIf.md#headergroupoptions)
- [headerSeparatorBorderVisible](TableOptionsIf.md#headerseparatorbordervisible)
- [headerToggleExpandCollapseIcons](TableOptionsIf.md#headertoggleexpandcollapseicons)
- [headerVerticalSeparator](TableOptionsIf.md#headerverticalseparator)
- [horizontalBorderVisible](TableOptionsIf.md#horizontalbordervisible)
- [hoverColumnVisible](TableOptionsIf.md#hovercolumnvisible)
- [hoverRowVisible](TableOptionsIf.md#hoverrowvisible)
- [initialState](TableOptionsIf.md#initialstate)
- [masterDetail](TableOptionsIf.md#masterdetail)
- [overflowX](TableOptionsIf.md#overflowx)
- [overflowY](TableOptionsIf.md#overflowy)
- [overlayOptions](TableOptionsIf.md#overlayoptions)
- [resizeEventDebounceDelay](TableOptionsIf.md#resizeeventdebouncedelay)
- [rowDragOptions](TableOptionsIf.md#rowdragoptions)
- [shortcutActionIdMapping](TableOptionsIf.md#shortcutactionidmapping)
- [shortcutActionsDisabled](TableOptionsIf.md#shortcutactionsdisabled)
- [showCheckboxWihoutExtraColumn](TableOptionsIf.md#showcheckboxwihoutextracolumn)
- [sortOrder](TableOptionsIf.md#sortorder)
- [sortedOptions](TableOptionsIf.md#sortedoptions)
- [spreadsheet](TableOptionsIf.md#spreadsheet)
- [stateChangedDebounceDelay](TableOptionsIf.md#statechangeddebouncedelay)
- [tableBottomBorderVisible](TableOptionsIf.md#tablebottombordervisible)
- [tableTopBorderVisible](TableOptionsIf.md#tabletopbordervisible)
- [treeOptions](TableOptionsIf.md#treeoptions)
- [undo](TableOptionsIf.md#undo)
- [verticalBorderVisible](TableOptionsIf.md#verticalbordervisible)

## Properties

### ariaDescribedBy

• `Optional` **ariaDescribedBy**: `string`

The id of an element that describes the table, e.g. a hint below it (`aria-describedby` of the grid).

**`Example`**

```ts
// <p id="orders-hint">Double click a header to sort.</p>
const tableOptions: TableOptionsIf = { ...new TableOptions(), ariaDescribedBy: "orders-hint" };
```

**`Since`**

1.1.91

#### Defined in

[src/lib/table/data/options/table-options.if.ts:321](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L321)

___

### ariaLabel

• `Optional` **ariaLabel**: `string`

The accessible name of the table for screen readers (`aria-label` of the grid), e.g. `"Orders"`.
Prefer [ariaLabelledBy](TableOptionsIf.md#arialabelledby) if the page shows a title.

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), ariaLabel: "Orders" };
```

**`Since`**

1.1.91

**`See`**

[Live demo: accessible order table](https://gui.expert/showcase/accessibility/run/) · Training: [Accessible tables: keyboard and screen readers](https://gui.expert/training/accessibility/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:298](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L298)

___

### ariaLabelledBy

• `Optional` **ariaLabelledBy**: `string`

The id of the element that names the table, e.g. a heading above it (`aria-labelledby` of the grid).
Takes precedence over [ariaLabel](TableOptionsIf.md#arialabel).

**`Example`**

```ts
// <h2 id="orders-title">Orders 2026</h2> <div class="table-div"></div>
const tableOptions: TableOptionsIf = { ...new TableOptions(), ariaLabelledBy: "orders-title" };
```

**`Since`**

1.1.91

#### Defined in

[src/lib/table/data/options/table-options.if.ts:310](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L310)

___

### ariaTexts

• `Optional` **ariaTexts**: `Partial`\<[`AriaTextsIf`](AriaTextsIf.md)\>

Own texts for screen readers – announcements (sorting, filter, copy, select all) and the names of the row
checkboxes and header group toggles. Functions you leave out keep their English default ([AriaTexts](../classes/AriaTexts.md)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  ariaTexts: {
    filtered: (rowCount: number) => `${rowCount} Zeilen`,
    copied: (cellCount: number) => `${cellCount} Zellen kopiert`,
    selectRow: (rowNumber: number) => `Zeile ${rowNumber} auswählen`,
  },
};
```

**`Since`**

1.1.91

#### Defined in

[src/lib/table/data/options/table-options.if.ts:339](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L339)

___

### autoRestoreOptions

• `Optional` **autoRestoreOptions**: [`AutoRestoreOptionsIf`](AutoRestoreOptionsIf.md)\<`any`\>

Remember sorting, scroll position and expanded tree nodes in `localStorage`. Off by default.

**`See`**

 - [AutoRestoreOptions](../classes/AutoRestoreOptions.md)
 - Training: [Remember the state](https://gui.expert/training/persist-state/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L254)

___

### batchEdit

• `Optional` **batchEdit**: `boolean` \| `Partial`\<[`BatchEditOptionsIf`](BatchEditOptionsIf.md)\>

Batch edit always on: edited and filled values are collected (marked `ge-table-cell-pending`) and written with
[TableApi.commitBatchEdit](../classes/TableApi.md#commitbatchedit) or discarded with [TableApi.cancelBatchEdit](../classes/TableApi.md#cancelbatchedit). Without it, start a batch
edit with [TableApi.startBatchEdit](../classes/TableApi.md#startbatchedit) (it ends with commit or cancel).

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), batchEdit: true };
```

**`Since`**

1.1.96

**`See`**

[Live demo: fill handle & batch edit](https://gui.expert/showcase/batchedit/run/) · Training: [Fill handle and batch edit](https://gui.expert/training/inline-editing/#fill-batch)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:493](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L493)

___

### cellFormulas

• `Optional` **cellFormulas**: `boolean` \| `Partial`\<[`CellFormulaOptionsIf`](CellFormulaOptionsIf.md)\>

Cell formulas like in Excel: a text with a leading `=` in the data (`row.total = "=B2*C2"`) is calculated –
references `A1`, `$B$3`, `B2:D10`, `A:A`, ≈ 70 functions, dependencies are recalculated after every write.
Row 1 is the first row of `getAllRows()` (sorting and filtering keep the references), column A the first data
column (row numbers and checkboxes don't count). The data keep the formula text; sorting, filters, totals, copy
and the Excel export use the results. `'=…` is the text `=…`. `true` = every data column with the defaults of
[CellFormulaOptions](../classes/CellFormulaOptions.md); `{ columns: ["total"] }` = only these properties. Flat bodies only (objects or
arrays; a tree, row grouping, pivot table or master/detail: a warning, no formulas). Not set: `"=1+1"` is text.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  editing: { defaultEditable: true },
  cellFormulas: true,
};
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/data/options/table-options.if.ts:466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L466)

___

### clipboard

• `Optional` **clipboard**: `boolean` \| `Partial`\<[`ClipboardOptionsIf`](ClipboardOptionsIf.md)\>

Copy, cut and paste like Excel and Google Sheets: Ctrl/⌘+C puts tab-separated text (with Excel's quoting) and an
HTML table into the clipboard, Ctrl/⌘+X marks the range (dashed frame) and moves it on paste, Ctrl/⌘+V pastes
from the anchor – tiled over a selected range, cut off at the last column, skipping read-only cells; **one**
`onModelChanged` with `source: "paste"` (or `"cut"`). `true` = defaults ([ClipboardOptions](../classes/ClipboardOptions.md)); without the
option Ctrl/⌘+C copies as before and Ctrl/⌘+X/V do nothing.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => new SelectionModel("range", "multi"),
  editing: true,
  clipboard: true,
};
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/data/options/table-options.if.ts:427](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L427)

___

### columnResizeHandleWidthInPx

• **columnResizeHandleWidthInPx**: `number`

The width of the column resize handle in pixels.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L180)

___

### columnsDraggable

• **columnsDraggable**: `boolean`

Flag indicating whether the columns are draggable.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:174](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L174)

___

### columnsResizable

• **columnsResizable**: `boolean`

Represents whether the columns are resizable.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L168)

___

### defaultRowHeights

• **defaultRowHeights**: [`DefaultRowHeightsIf`](DefaultRowHeightsIf.md)

Row heights of header, body and footer in px (default 34 / 34 / 34). Read by [TableFactory.createTableModel](../classes/TableFactory.md#createtablemodel)
when it creates the area models – pass the options there as `tableOptions`, too.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L200)

___

### direction

• `Optional` **direction**: [`TableDirection`](../modules.md#tabledirection)

Writing direction: `"ltr"` (default), `"rtl"` for Arabic, Hebrew, Persian, Urdu … (first column on the right,
horizontal scrolling, fixed columns, tree indent, resize handles and arrow keys mirrored) or `"auto"` (the
direction of the page: `dir="rtl"` on `<html>` or a parent element). Read once when the table is built – a new
options object rebuilds the table in the wrappers.

In right-to-left, the "left" and "right" in names of the API mean **start** and **end**:
`fixedLeftColumnCount` fixes columns at the start (right), `fixedRightColumnCount` at the end (left),
`ge-table-text-align-left` aligns to the start. The table sets `dir` on its host element (also `dir="ltr"`).

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), direction: "rtl" };
```

**`Since`**

1.1.98

**`See`**

[Live demo: right-to-left](https://gui.expert/showcase/rtl/run/) · Training: [Right-to-left](https://gui.expert/training/theming-dark-mode/#rtl)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:530](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L530)

___

### editing

• `Optional` **editing**: `boolean` \| `Partial`\<[`EditingOptionsIf`](EditingOptionsIf.md)\>

Excel-style editing: typing on a focused cell opens the editor (the text is replaced), Enter edits, Enter/Tab
commit and move on, Shift+arrows extend the selection, Ctrl/⌘+arrows jump to the edge of the data, Delete
clears the selected cells, Ctrl/⌘+Enter writes into all selected cells. The editor lives above the cell and
survives scrolling. `true` = defaults ([EditingOptions](../classes/EditingOptions.md)); without the option the table behaves as before
(F2/double click edit, Enter activates, Tab leaves the table).

**`Example`**

```ts
const selectionModel = new SelectionModel("range", "multi");
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel,
  editing: { defaultEditable: true },   // every data column can be edited
};
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/data/options/table-options.if.ts:408](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L408)

___

### externalFilterFunction

• **externalFilterFunction**: `undefined` \| [`FilterFunction`](../modules.md#filterfunction)\<`any`\>

Your filter: called for every row, return `true` to show it. After changing the filter criteria call
[TableApi.externalFilterChanged](../classes/TableApi.md#externalfilterchanged) – the table filters again and keeps the sort order.

**`Example`**

```ts
const filter = { text: "" };
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  externalFilterFunction: (order: Order) => order.customer.toLowerCase().includes(filter.text)
};
searchInput.addEventListener("input", () => {
  filter.text = searchInput.value.toLowerCase();
  tableApi.externalFilterChanged();
});
```

**`See`**

Training: [Filtering with a live search](https://gui.expert/training/filtering/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:237](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L237)

___

### fillHandle

• `Optional` **fillHandle**: `boolean` \| `Partial`\<[`FillHandleOptionsIf`](FillHandleOptionsIf.md)\>

The fill handle: a small square at the bottom right corner of the selected range. Dragging it fills the
neighbouring cells (copy, or a series: 1, 2, 3 …, dates, `Item 1` → `Item 2`); ⌥/Alt switches between series and
copy. Keyboard: Ctrl/⌘+D fills down, Ctrl/⌘+R fills right. Needs a selection model of the type `"range"`;
only editable cells are filled. `true` = defaults ([FillHandleOptions](../classes/FillHandleOptions.md)).

**`Example`**

```ts
const selectionModel = new SelectionModel("range", "multi");   // one model – not a new one per call
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel,
  fillHandle: true,
};
```

**`Since`**

1.1.96

**`See`**

[Live demo: fill handle & batch edit](https://gui.expert/showcase/batchedit/run/) · Training: [Fill handle and batch edit](https://gui.expert/training/inline-editing/#fill-batch)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:389](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L389)

___

### fixedEastSeparatorBorderVisible

• **fixedEastSeparatorBorderVisible**: `boolean`

Determines whether the fixed east separator border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L104)

___

### fixedWestSeparatorBorderVisible

• **fixedWestSeparatorBorderVisible**: `boolean`

Indicates whether the fixed west separator border should be visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L110)

___

### footerSeparatorBorderVisible

• **footerSeparatorBorderVisible**: `boolean`

Indicates whether the footer separator border is visible or not.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L98)

___

### footerVerticalSeparator

• **footerVerticalSeparator**: `boolean`

Indicates whether a vertical separator should be displayed in the footer.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L194)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor for a cell, if the column has no own [ColumnDefIf.getEditRenderer](ColumnDefIf.md#geteditrenderer).
Default: a text input ([InputCellRenderer](../classes/InputCellRenderer.md)).

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:262](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L262)

___

### getFocusModel

• `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](FocusModelIf.md)\>

Returns the focus model of the table. Default: every table creates its own [FocusModel](../classes/FocusModel.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:277](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L277)

___

### getSelectionModel

• `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](SelectionModelIf.md)\>

Returns the selection model of the table. Without it every table creates its own `new SelectionModel()`
of type `"none"` – nothing can be selected.

**`Example`**

```ts
const selectionModel = new SelectionModel("row", "single");
const tableOptions: TableOptionsIf = { ...new TableOptions(), getSelectionModel: () => selectionModel };
```

**`See`**

Training: [Select cells, rows and ranges](https://gui.expert/training/selection-and-copy/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:274](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L274)

___

### headerGroupOptions

• **headerGroupOptions**: [`HeaderGroupOptionsIf`](HeaderGroupOptionsIf.md)

Icons of collapsible header groups ([AreaModelCellGroups](../classes/AreaModelCellGroups.md)).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:209](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L209)

___

### headerSeparatorBorderVisible

• **headerSeparatorBorderVisible**: `boolean`

Indicates whether the header separator border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L92)

___

### headerToggleExpandCollapseIcons

• **headerToggleExpandCollapseIcons**: `boolean`

Reserved – currently not evaluated (tree tables always show the expand-all / collapse-all icon in the top left header cell).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:203](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L203)

___

### headerVerticalSeparator

• **headerVerticalSeparator**: `boolean`

Represents whether a vertical separator should be displayed in a header.

**`Since`**

1.0.0

#### Defined in

[src/lib/table/data/options/table-options.if.ts:188](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L188)

___

### horizontalBorderVisible

• **horizontalBorderVisible**: `boolean`

Represents the visibility of the horizontal border.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L122)

___

### hoverColumnVisible

• **hoverColumnVisible**: `boolean`

Flag indicating whether the hover color of a column is visible or not in general.
If true, the column get the hover background color while the mouse is over the column.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:162](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L162)

___

### hoverRowVisible

• **hoverRowVisible**: `boolean`

Flag indicating whether the hover color of a row is visible or not in general.
If true, the row get the hover background color while the mouse is over the row.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:155](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L155)

___

### initialState

• `Optional` **initialState**: `Partial`\<[`TableStateIf`](TableStateIf.md)\>

The state the table starts with: column layout, sorting, tree, checked and selected rows … – e.g. loaded from
your server ([TableApi.getState](../classes/TableApi.md#getstate), [EventListenerIf.onStateChanged](EventListenerIf.md#onstatechanged)). A state stored by
[autoRestoreOptions](TableOptionsIf.md#autorestoreoptions) wins over it, part by part.

**`Example`**

```ts
const saved = (await (await fetch("/api/prefs/orders")).json()) as TableStateIf | null;
const tableOptions: TableOptionsIf = { ...new TableOptions(), initialState: saved ?? undefined };
```

**`Since`**

1.1.92

**`See`**

[Live demo: persisted layout](https://gui.expert/showcase/state/run/) · Training: [Remember the state](https://gui.expert/training/persist-state/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:544](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L544)

___

### masterDetail

• `Optional` **masterDetail**: `Partial`\<[`MasterDetailOptionsIf`](MasterDetailOptionsIf.md)\<`any`\>\>

Master/detail: master rows get an expand icon; below an expanded row a detail row over the full width shows any
content (a nested table, a form, a framework component – see [MasterDetailOptionsIf](MasterDetailOptionsIf.md)). Only for flat body
models. Fields you leave out keep their default ([MasterDetailOptions](../classes/MasterDetailOptions.md)); `detailRenderer` is required.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  masterDetail: {
    detailHeight: "auto",
    detailRenderer: (container, row) => { container.textContent = `Notes: ${row.notes}`; }
  }
};
```

**`Since`**

1.1.97

**`See`**

[Live demo: master/detail](https://gui.expert/showcase/masterdetail/run/) · Training: [Master/detail](https://gui.expert/training/master-detail/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:512](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L512)

___

### overflowX

• **overflowX**: ``"auto"`` \| ``"scroll"``

The value of the css `overflowX` determines the behavior of horizontal overflow for the table body (scroll port).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L129)

___

### overflowY

• **overflowY**: ``"auto"`` \| ``"scroll"``

The value of the css `overflowX` determines the behavior of vertical overflow for the table body (scroll port).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:135](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L135)

___

### overlayOptions

• `Optional` **overlayOptions**: `Partial`\<[`OverlayOptionsIf`](OverlayOptionsIf.md)\>

Texts and behaviour of the overlays over the body: "Loading…" ([TableApi.showLoadingOverlay](../classes/TableApi.md#showloadingoverlay)),
"No rows to show" (empty body, automatic) and "No matching rows" (the filter hides all rows).
Fields you leave out keep their default ([OverlayOptions](../classes/OverlayOptions.md)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  overlayOptions: { noRowsText: "No orders yet", blockInteractionWhileLoading: false },
};
```

**`Since`**

1.1.92

**`See`**

[Live demo: loading & empty states](https://gui.expert/showcase/overlays/run/) · Training: [Loading and empty tables](https://gui.expert/training/live-data/#overlays)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:355](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L355)

___

### resizeEventDebounceDelay

• **resizeEventDebounceDelay**: `number`

The delay in milliseconds used for debouncing the resize event.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L85)

___

### rowDragOptions

• `Optional` **rowDragOptions**: `Partial`\<[`RowDragOptionsIf`](RowDragOptionsIf.md)\>

Row drag: managed or events only, multi-row drag, tree drop, auto-scroll (see [RowDragOptionsIf](RowDragOptionsIf.md)). The drag
handles come from [ColumnDefIf.rowDrag](ColumnDefIf.md#rowdrag). Fields you leave out keep their default ([RowDragOptions](../classes/RowDragOptions.md)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  rowDragOptions: { managed: false },   // only events – e.g. the server decides
};
```

**`Since`**

1.1.95

**`See`**

[Live demo: row drag](https://gui.expert/showcase/rowdrag/run/) · Training: [Dragging rows into order](https://gui.expert/training/events-and-context-menu/#row-drag)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:370](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L370)

___

### shortcutActionIdMapping

• `Optional` **shortcutActionIdMapping**: [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

Own keyboard shortcuts: maps a shortcut (e.g. `"ctrl+c"`, `"f2"`) to an [ActionId](../modules.md#actionid).
Default: [WindowsShortcutActionIdMapping](../classes/WindowsShortcutActionIdMapping.md) resp. [OsxShortcutActionIdMapping](../classes/OsxShortcutActionIdMapping.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:283](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L283)

___

### shortcutActionsDisabled

• **shortcutActionsDisabled**: `boolean`

Switch off all keyboard shortcuts of the table (copy, select all, navigation, F2 …).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:286](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L286)

___

### showCheckboxWihoutExtraColumn

• **showCheckboxWihoutExtraColumn**: `boolean`

Indicates whether to show checkbox without an extra column.
If true and the row is checkable, a checkbox is rendered in the first column.
If false and the row is checkable, a checkbox is rendered in an extra column left to the first column.

**`See`**

Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:218](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L218)

___

### sortOrder

• **sortOrder**: [`SortState`](../modules.md#sortstate)[]

The order of the sort states on repeated double-clicks on a header, default `["asc", "desc"]`.
Add `""` to get "unsorted" as third state. Per column: [ColumnDefIf.sortStatesOrder](ColumnDefIf.md#sortstatesorder).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:246](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L246)

___

### sortedOptions

• **sortedOptions**: [`SortedOptionsIf`](SortedOptionsIf.md)

The sort icons shown in sortable header cells.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L240)

___

### spreadsheet

• `Optional` **spreadsheet**: `boolean` \| `Partial`\<[`SpreadsheetOptionsIf`](SpreadsheetOptionsIf.md)\>

Preset „like a spreadsheet“ for existing models: switches on `editing` (with `defaultEditable`), `clipboard`,
`undo`, `cellFormulas` and `fillHandle` – unless the options set them themselves – and a range selection.
An object switches single parts off (`false`) or configures them ([SpreadsheetOptionsIf](SpreadsheetOptionsIf.md)). For a new, empty
sheet use [SpreadsheetFactory](../classes/SpreadsheetFactory.md); column letters above existing headers: `TableFactory.createTableModel({ …,
columnLetters: true })`.

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), spreadsheet: true };
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/data/options/table-options.if.ts:480](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L480)

___

### stateChangedDebounceDelay

• `Optional` **stateChangedDebounceDelay**: `number`

Delay in ms between the last change of the state (resize, sort, scroll …) and
[EventListenerIf.onStateChanged](EventListenerIf.md#onstatechanged) / the save of [autoRestoreOptions](TableOptionsIf.md#autorestoreoptions). Default 300.

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/table-options.if.ts:552](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L552)

___

### tableBottomBorderVisible

• **tableBottomBorderVisible**: `boolean`

Specifies whether the bottom border of a table is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L148)

___

### tableTopBorderVisible

• **tableTopBorderVisible**: `boolean`

Indicates whether the top border of a table is visible or hidden.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L142)

___

### treeOptions

• **treeOptions**: [`TreeOptionsIf`](TreeOptionsIf.md)

Icons and behaviour of tree tables (arrows, indentation). See [TreeOptionsIf](TreeOptionsIf.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:206](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L206)

___

### undo

• `Optional` **undo**: `boolean` \| `Partial`\<[`UndoOptionsIf`](UndoOptionsIf.md)\>

Undo and redo: Ctrl/⌘+Z undoes the last change – an edit, a fill, a paste, a cut, Delete – as **one** step,
Ctrl+Y or Ctrl/⌘+Shift+Z redoes it (source `"undo"`/`"redo"` in `onModelChanged`). Cells are found by their row
object (sorting and filtering in between don't matter). `true` = defaults ([UndoOptions](../classes/UndoOptions.md)); without the option
Ctrl/⌘+Z does nothing (as before). In a batch edit the marked values are undone; commit and cancel empty the
history.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  editing: true,
  clipboard: true,
  undo: true,
};
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/data/options/table-options.if.ts:446](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L446)

___

### verticalBorderVisible

• **verticalBorderVisible**: `boolean`

Indicates whether the vertical border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L116)
