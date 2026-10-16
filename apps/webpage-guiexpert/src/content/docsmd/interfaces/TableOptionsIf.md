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
- [columnResizeHandleWidthInPx](TableOptionsIf.md#columnresizehandlewidthinpx)
- [columnsDraggable](TableOptionsIf.md#columnsdraggable)
- [columnsResizable](TableOptionsIf.md#columnsresizable)
- [defaultRowHeights](TableOptionsIf.md#defaultrowheights)
- [direction](TableOptionsIf.md#direction)
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
- [stateChangedDebounceDelay](TableOptionsIf.md#statechangeddebouncedelay)
- [tableBottomBorderVisible](TableOptionsIf.md#tablebottombordervisible)
- [tableTopBorderVisible](TableOptionsIf.md#tabletopbordervisible)
- [treeOptions](TableOptionsIf.md#treeoptions)
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

[src/lib/table/data/options/table-options.if.ts:316](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L316)

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

[src/lib/table/data/options/table-options.if.ts:293](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L293)

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

[src/lib/table/data/options/table-options.if.ts:305](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L305)

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

[src/lib/table/data/options/table-options.if.ts:334](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L334)

___

### autoRestoreOptions

• `Optional` **autoRestoreOptions**: [`AutoRestoreOptionsIf`](AutoRestoreOptionsIf.md)\<`any`\>

Remember sorting, scroll position and expanded tree nodes in `localStorage`. Off by default.

**`See`**

 - [AutoRestoreOptions](../classes/AutoRestoreOptions.md)
 - Training: [Remember the state](https://gui.expert/training/persist-state/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:249](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L249)

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

[src/lib/table/data/options/table-options.if.ts:397](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L397)

___

### columnResizeHandleWidthInPx

• **columnResizeHandleWidthInPx**: `number`

The width of the column resize handle in pixels.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:175](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L175)

___

### columnsDraggable

• **columnsDraggable**: `boolean`

Flag indicating whether the columns are draggable.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:169](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L169)

___

### columnsResizable

• **columnsResizable**: `boolean`

Represents whether the columns are resizable.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:163](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L163)

___

### defaultRowHeights

• **defaultRowHeights**: [`DefaultRowHeightsIf`](DefaultRowHeightsIf.md)

Row heights of header, body and footer in px (default 34 / 34 / 34). Read by [TableFactory.createTableModel](../classes/TableFactory.md#createtablemodel)
when it creates the area models – pass the options there as `tableOptions`, too.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:195](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L195)

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

[src/lib/table/data/options/table-options.if.ts:434](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L434)

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

[src/lib/table/data/options/table-options.if.ts:232](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L232)

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

[src/lib/table/data/options/table-options.if.ts:384](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L384)

___

### fixedEastSeparatorBorderVisible

• **fixedEastSeparatorBorderVisible**: `boolean`

Determines whether the fixed east separator border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L99)

___

### fixedWestSeparatorBorderVisible

• **fixedWestSeparatorBorderVisible**: `boolean`

Indicates whether the fixed west separator border should be visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L105)

___

### footerSeparatorBorderVisible

• **footerSeparatorBorderVisible**: `boolean`

Indicates whether the footer separator border is visible or not.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L93)

___

### footerVerticalSeparator

• **footerVerticalSeparator**: `boolean`

Indicates whether a vertical separator should be displayed in the footer.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:189](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L189)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor for a cell, if the column has no own [ColumnDefIf.getEditRenderer](ColumnDefIf.md#geteditrenderer).
Default: a text input ([InputCellRenderer](../classes/InputCellRenderer.md)).

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:257](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L257)

___

### getFocusModel

• `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](FocusModelIf.md)\>

Returns the focus model of the table. Default: every table creates its own [FocusModel](../classes/FocusModel.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:272](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L272)

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

[src/lib/table/data/options/table-options.if.ts:269](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L269)

___

### headerGroupOptions

• **headerGroupOptions**: [`HeaderGroupOptionsIf`](HeaderGroupOptionsIf.md)

Icons of collapsible header groups ([AreaModelCellGroups](../classes/AreaModelCellGroups.md)).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:204](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L204)

___

### headerSeparatorBorderVisible

• **headerSeparatorBorderVisible**: `boolean`

Indicates whether the header separator border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L87)

___

### headerToggleExpandCollapseIcons

• **headerToggleExpandCollapseIcons**: `boolean`

Reserved – currently not evaluated (tree tables always show the expand-all / collapse-all icon in the top left header cell).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:198](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L198)

___

### headerVerticalSeparator

• **headerVerticalSeparator**: `boolean`

Represents whether a vertical separator should be displayed in a header.

**`Since`**

1.0.0

#### Defined in

[src/lib/table/data/options/table-options.if.ts:183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L183)

___

### horizontalBorderVisible

• **horizontalBorderVisible**: `boolean`

Represents the visibility of the horizontal border.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L117)

___

### hoverColumnVisible

• **hoverColumnVisible**: `boolean`

Flag indicating whether the hover color of a column is visible or not in general.
If true, the column get the hover background color while the mouse is over the column.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:157](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L157)

___

### hoverRowVisible

• **hoverRowVisible**: `boolean`

Flag indicating whether the hover color of a row is visible or not in general.
If true, the row get the hover background color while the mouse is over the row.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L150)

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

[src/lib/table/data/options/table-options.if.ts:448](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L448)

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

[src/lib/table/data/options/table-options.if.ts:416](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L416)

___

### overflowX

• **overflowX**: ``"auto"`` \| ``"scroll"``

The value of the css `overflowX` determines the behavior of horizontal overflow for the table body (scroll port).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L124)

___

### overflowY

• **overflowY**: ``"auto"`` \| ``"scroll"``

The value of the css `overflowX` determines the behavior of vertical overflow for the table body (scroll port).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L130)

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

[src/lib/table/data/options/table-options.if.ts:350](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L350)

___

### resizeEventDebounceDelay

• **resizeEventDebounceDelay**: `number`

The delay in milliseconds used for debouncing the resize event.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L80)

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

[src/lib/table/data/options/table-options.if.ts:365](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L365)

___

### shortcutActionIdMapping

• `Optional` **shortcutActionIdMapping**: [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

Own keyboard shortcuts: maps a shortcut (e.g. `"ctrl+c"`, `"f2"`) to an [ActionId](../modules.md#actionid).
Default: [WindowsShortcutActionIdMapping](../classes/WindowsShortcutActionIdMapping.md) resp. [OsxShortcutActionIdMapping](../classes/OsxShortcutActionIdMapping.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:278](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L278)

___

### shortcutActionsDisabled

• **shortcutActionsDisabled**: `boolean`

Switch off all keyboard shortcuts of the table (copy, select all, navigation, F2 …).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:281](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L281)

___

### showCheckboxWihoutExtraColumn

• **showCheckboxWihoutExtraColumn**: `boolean`

Indicates whether to show checkbox without an extra column.
If true and the row is checkable, a checkbox is rendered in the first column.
If false and the row is checkable, a checkbox is rendered in an extra column left to the first column.

**`See`**

Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:213](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L213)

___

### sortOrder

• **sortOrder**: [`SortState`](../modules.md#sortstate)[]

The order of the sort states on repeated double-clicks on a header, default `["asc", "desc"]`.
Add `""` to get "unsorted" as third state. Per column: [ColumnDefIf.sortStatesOrder](ColumnDefIf.md#sortstatesorder).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:241](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L241)

___

### sortedOptions

• **sortedOptions**: [`SortedOptionsIf`](SortedOptionsIf.md)

The sort icons shown in sortable header cells.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:235](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L235)

___

### stateChangedDebounceDelay

• `Optional` **stateChangedDebounceDelay**: `number`

Delay in ms between the last change of the state (resize, sort, scroll …) and
[EventListenerIf.onStateChanged](EventListenerIf.md#onstatechanged) / the save of [autoRestoreOptions](TableOptionsIf.md#autorestoreoptions). Default 300.

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/table-options.if.ts:456](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L456)

___

### tableBottomBorderVisible

• **tableBottomBorderVisible**: `boolean`

Specifies whether the bottom border of a table is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L143)

___

### tableTopBorderVisible

• **tableTopBorderVisible**: `boolean`

Indicates whether the top border of a table is visible or hidden.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:137](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L137)

___

### treeOptions

• **treeOptions**: [`TreeOptionsIf`](TreeOptionsIf.md)

Icons and behaviour of tree tables (arrows, indentation). See [TreeOptionsIf](TreeOptionsIf.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:201](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L201)

___

### verticalBorderVisible

• **verticalBorderVisible**: `boolean`

Indicates whether the vertical border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L111)
