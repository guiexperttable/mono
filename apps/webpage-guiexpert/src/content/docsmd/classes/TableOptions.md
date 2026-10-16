[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableOptions

# Class: TableOptions

All default options of a table – see [TableOptionsIf](../interfaces/TableOptionsIf.md) for the meaning of each field.

Use it with the spread pattern: all defaults, plus your changes.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  hoverColumnVisible: false,
  verticalBorderVisible: false,
  defaultRowHeights: { header: 40, body: 30, footer: 36 },
  externalFilterFunction: (order: Order) => order.total > 1000
};
```

**`See`**

Training: [TableOptions: behaviour and look](https://gui.expert/training/table-options/)

## Implements

- [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

## Table of contents

### Constructors

- [constructor](TableOptions.md#constructor)

### Properties

- [ariaDescribedBy](TableOptions.md#ariadescribedby)
- [ariaLabel](TableOptions.md#arialabel)
- [ariaLabelledBy](TableOptions.md#arialabelledby)
- [ariaTexts](TableOptions.md#ariatexts)
- [batchEdit](TableOptions.md#batchedit)
- [columnResizeHandleWidthInPx](TableOptions.md#columnresizehandlewidthinpx)
- [columnsDraggable](TableOptions.md#columnsdraggable)
- [columnsResizable](TableOptions.md#columnsresizable)
- [defaultRowHeights](TableOptions.md#defaultrowheights)
- [externalFilterFunction](TableOptions.md#externalfilterfunction)
- [fillHandle](TableOptions.md#fillhandle)
- [fixedEastSeparatorBorderVisible](TableOptions.md#fixedeastseparatorbordervisible)
- [fixedWestSeparatorBorderVisible](TableOptions.md#fixedwestseparatorbordervisible)
- [footerSeparatorBorderVisible](TableOptions.md#footerseparatorbordervisible)
- [footerVerticalSeparator](TableOptions.md#footerverticalseparator)
- [getEditRenderer](TableOptions.md#geteditrenderer)
- [getFocusModel](TableOptions.md#getfocusmodel)
- [getSelectionModel](TableOptions.md#getselectionmodel)
- [headerGroupOptions](TableOptions.md#headergroupoptions)
- [headerSeparatorBorderVisible](TableOptions.md#headerseparatorbordervisible)
- [headerToggleExpandCollapseIcons](TableOptions.md#headertoggleexpandcollapseicons)
- [headerVerticalSeparator](TableOptions.md#headerverticalseparator)
- [horizontalBorderVisible](TableOptions.md#horizontalbordervisible)
- [hoverColumnVisible](TableOptions.md#hovercolumnvisible)
- [hoverRowVisible](TableOptions.md#hoverrowvisible)
- [masterDetail](TableOptions.md#masterdetail)
- [overflowX](TableOptions.md#overflowx)
- [overflowY](TableOptions.md#overflowy)
- [overlayOptions](TableOptions.md#overlayoptions)
- [resizeEventDebounceDelay](TableOptions.md#resizeeventdebouncedelay)
- [rowDragOptions](TableOptions.md#rowdragoptions)
- [shortcutActionIdMapping](TableOptions.md#shortcutactionidmapping)
- [shortcutActionsDisabled](TableOptions.md#shortcutactionsdisabled)
- [showCheckboxWihoutExtraColumn](TableOptions.md#showcheckboxwihoutextracolumn)
- [sortOrder](TableOptions.md#sortorder)
- [sortedOptions](TableOptions.md#sortedoptions)
- [tableBottomBorderVisible](TableOptions.md#tablebottombordervisible)
- [tableTopBorderVisible](TableOptions.md#tabletopbordervisible)
- [treeOptions](TableOptions.md#treeoptions)
- [verticalBorderVisible](TableOptions.md#verticalbordervisible)

## Constructors

### constructor

• **new TableOptions**(): [`TableOptions`](TableOptions.md)

#### Returns

[`TableOptions`](TableOptions.md)

## Properties

### ariaDescribedBy

• `Optional` **ariaDescribedBy**: `string` = `undefined`

Id of the element that describes the table (`aria-describedby`). Default: none.

**`Since`**

1.1.91

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[ariaDescribedBy](../interfaces/TableOptionsIf.md#ariadescribedby)

#### Defined in

[src/lib/table/data/options/table-options.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L106)

___

### ariaLabel

• `Optional` **ariaLabel**: `string` = `undefined`

Accessible name of the table (`aria-label`). Default: none.

**`Since`**

1.1.91

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[ariaLabel](../interfaces/TableOptionsIf.md#arialabel)

#### Defined in

[src/lib/table/data/options/table-options.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L100)

___

### ariaLabelledBy

• `Optional` **ariaLabelledBy**: `string` = `undefined`

Id of the element that names the table (`aria-labelledby`). Default: none.

**`Since`**

1.1.91

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[ariaLabelledBy](../interfaces/TableOptionsIf.md#arialabelledby)

#### Defined in

[src/lib/table/data/options/table-options.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L103)

___

### ariaTexts

• `Optional` **ariaTexts**: `Partial`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md)\> = `undefined`

Own screen reader texts; missing functions use the English defaults ([AriaTexts](AriaTexts.md)).

**`Since`**

1.1.91

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[ariaTexts](../interfaces/TableOptionsIf.md#ariatexts)

#### Defined in

[src/lib/table/data/options/table-options.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L109)

___

### batchEdit

• `Optional` **batchEdit**: `boolean` \| `Partial`\<[`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)\> = `undefined`

Batch edit always on: edited and filled values are collected (marked `ge-table-cell-pending`) and written with
[TableApi.commitBatchEdit](TableApi.md#commitbatchedit) or discarded with [TableApi.cancelBatchEdit](TableApi.md#cancelbatchedit). Without it, start a batch
edit with [TableApi.startBatchEdit](TableApi.md#startbatchedit) (it ends with commit or cancel).

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), batchEdit: true };
```

**`Since`**

1.1.96

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[batchEdit](../interfaces/TableOptionsIf.md#batchedit)

#### Defined in

[src/lib/table/data/options/table-options.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L116)

___

### columnResizeHandleWidthInPx

• **columnResizeHandleWidthInPx**: `number` = `4`

The width of the column resize handle in pixels.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[columnResizeHandleWidthInPx](../interfaces/TableOptionsIf.md#columnresizehandlewidthinpx)

#### Defined in

[src/lib/table/data/options/table-options.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L61)

___

### columnsDraggable

• **columnsDraggable**: `boolean` = `true`

Flag indicating whether the columns are draggable.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[columnsDraggable](../interfaces/TableOptionsIf.md#columnsdraggable)

#### Defined in

[src/lib/table/data/options/table-options.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L60)

___

### columnsResizable

• **columnsResizable**: `boolean` = `true`

Represents whether the columns are resizable.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[columnsResizable](../interfaces/TableOptionsIf.md#columnsresizable)

#### Defined in

[src/lib/table/data/options/table-options.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L59)

___

### defaultRowHeights

• **defaultRowHeights**: [`DefaultRowHeightsIf`](../interfaces/DefaultRowHeightsIf.md)

Row heights of header, body and footer in px (default 34 / 34 / 34). Read by [TableFactory.createTableModel](TableFactory.md#createtablemodel)
when it creates the area models – pass the options there as `tableOptions`, too.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[defaultRowHeights](../interfaces/TableOptionsIf.md#defaultrowheights)

#### Defined in

[src/lib/table/data/options/table-options.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L63)

___

### externalFilterFunction

• **externalFilterFunction**: `undefined` \| [`FilterFunction`](../modules.md#filterfunction)\<`any`\> = `undefined`

Your filter: called for every row, return `true` to show it. After changing the filter criteria call
[TableApi.externalFilterChanged](TableApi.md#externalfilterchanged) – the table filters again and keeps the sort order.

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

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[externalFilterFunction](../interfaces/TableOptionsIf.md#externalfilterfunction)

#### Defined in

[src/lib/table/data/options/table-options.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L78)

___

### fillHandle

• `Optional` **fillHandle**: `boolean` \| `Partial`\<[`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)\> = `undefined`

The fill handle: a small square at the bottom right corner of the selected range. Dragging it fills the
neighbouring cells (copy, or a series: 1, 2, 3 …, dates, `Item 1` → `Item 2`); ⌥/Alt switches between series and
copy. Keyboard: Ctrl/⌘+D fills down, Ctrl/⌘+R fills right. Needs a selection model of the type `"range"`;
only editable cells are filled. `true` = defaults ([FillHandleOptions](FillHandleOptions.md)).

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

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[fillHandle](../interfaces/TableOptionsIf.md#fillhandle)

#### Defined in

[src/lib/table/data/options/table-options.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L114)

___

### fixedEastSeparatorBorderVisible

• **fixedEastSeparatorBorderVisible**: `boolean` = `true`

Determines whether the fixed east separator border is visible.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[fixedEastSeparatorBorderVisible](../interfaces/TableOptionsIf.md#fixedeastseparatorbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L49)

___

### fixedWestSeparatorBorderVisible

• **fixedWestSeparatorBorderVisible**: `boolean` = `true`

Indicates whether the fixed west separator border should be visible.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[fixedWestSeparatorBorderVisible](../interfaces/TableOptionsIf.md#fixedwestseparatorbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L50)

___

### footerSeparatorBorderVisible

• **footerSeparatorBorderVisible**: `boolean` = `true`

Indicates whether the footer separator border is visible or not.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[footerSeparatorBorderVisible](../interfaces/TableOptionsIf.md#footerseparatorbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L47)

___

### footerVerticalSeparator

• **footerVerticalSeparator**: `boolean` = `false`

Indicates whether a vertical separator should be displayed in the footer.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[footerVerticalSeparator](../interfaces/TableOptionsIf.md#footerverticalseparator)

#### Defined in

[src/lib/table/data/options/table-options.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L69)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor for a cell, if the column has no own [ColumnDefIf.getEditRenderer](../interfaces/ColumnDefIf.md#geteditrenderer).
Default: a text input ([InputCellRenderer](InputCellRenderer.md)).

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[getEditRenderer](../interfaces/TableOptionsIf.md#geteditrenderer)

#### Defined in

[src/lib/table/data/options/table-options.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L86)

___

### getFocusModel

• `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\> = `undefined`

Focus model of the table. Not set (default): every table creates its own `new FocusModel("cell")`.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[getFocusModel](../interfaces/TableOptionsIf.md#getfocusmodel)

#### Defined in

[src/lib/table/data/options/table-options.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L97)

___

### getSelectionModel

• `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\> = `undefined`

Selection model of the table. Not set (default): every table creates its own model
(`new SelectionModel()`, type "none") – tables never share a selection.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[getSelectionModel](../interfaces/TableOptionsIf.md#getselectionmodel)

#### Defined in

[src/lib/table/data/options/table-options.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L92)

___

### headerGroupOptions

• **headerGroupOptions**: [`HeaderGroupOptions`](HeaderGroupOptions.md)

Icons of collapsible header groups ([AreaModelCellGroups](AreaModelCellGroups.md)).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[headerGroupOptions](../interfaces/TableOptionsIf.md#headergroupoptions)

#### Defined in

[src/lib/table/data/options/table-options.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L75)

___

### headerSeparatorBorderVisible

• **headerSeparatorBorderVisible**: `boolean` = `true`

Indicates whether the header separator border is visible.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[headerSeparatorBorderVisible](../interfaces/TableOptionsIf.md#headerseparatorbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L48)

___

### headerToggleExpandCollapseIcons

• **headerToggleExpandCollapseIcons**: `boolean` = `false`

Reserved – currently not evaluated (tree tables always show the expand-all / collapse-all icon in the top left header cell).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[headerToggleExpandCollapseIcons](../interfaces/TableOptionsIf.md#headertoggleexpandcollapseicons)

#### Defined in

[src/lib/table/data/options/table-options.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L71)

___

### headerVerticalSeparator

• **headerVerticalSeparator**: `boolean` = `false`

Represents whether a vertical separator should be displayed in a header.

**`Since`**

1.0.0

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[headerVerticalSeparator](../interfaces/TableOptionsIf.md#headerverticalseparator)

#### Defined in

[src/lib/table/data/options/table-options.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L72)

___

### horizontalBorderVisible

• **horizontalBorderVisible**: `boolean` = `true`

Represents the visibility of the horizontal border.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[horizontalBorderVisible](../interfaces/TableOptionsIf.md#horizontalbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L45)

___

### hoverColumnVisible

• **hoverColumnVisible**: `boolean` = `true`

Flag indicating whether the hover color of a column is visible or not in general.
If true, the column get the hover background color while the mouse is over the column.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[hoverColumnVisible](../interfaces/TableOptionsIf.md#hovercolumnvisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L58)

___

### hoverRowVisible

• **hoverRowVisible**: `boolean` = `true`

Flag indicating whether the hover color of a row is visible or not in general.
If true, the row get the hover background color while the mouse is over the row.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[hoverRowVisible](../interfaces/TableOptionsIf.md#hoverrowvisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L57)

___

### masterDetail

• `Optional` **masterDetail**: `Partial`\<[`MasterDetailOptionsIf`](../interfaces/MasterDetailOptionsIf.md)\<`any`\>\> = `undefined`

Master/detail: master rows get an expand icon; below an expanded row a detail row over the full width shows any
content (a nested table, a form, a framework component – see [MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md)). Only for flat body
models. Fields you leave out keep their default ([MasterDetailOptions](MasterDetailOptions.md)); `detailRenderer` is required.

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

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[masterDetail](../interfaces/TableOptionsIf.md#masterdetail)

#### Defined in

[src/lib/table/data/options/table-options.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L115)

___

### overflowX

• **overflowX**: ``"auto"`` \| ``"scroll"`` = `"auto"`

The value of the css `overflowX` determines the behavior of horizontal overflow for the table body (scroll port).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[overflowX](../interfaces/TableOptionsIf.md#overflowx)

#### Defined in

[src/lib/table/data/options/table-options.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L42)

___

### overflowY

• **overflowY**: ``"auto"`` \| ``"scroll"`` = `"auto"`

The value of the css `overflowX` determines the behavior of vertical overflow for the table body (scroll port).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[overflowY](../interfaces/TableOptionsIf.md#overflowy)

#### Defined in

[src/lib/table/data/options/table-options.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L43)

___

### overlayOptions

• `Optional` **overlayOptions**: `Partial`\<[`OverlayOptionsIf`](../interfaces/OverlayOptionsIf.md)\> = `undefined`

Texts and behaviour of the "Loading…" / "No rows" overlays; missing fields use [OverlayOptions](OverlayOptions.md).

**`Since`**

1.1.92

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[overlayOptions](../interfaces/TableOptionsIf.md#overlayoptions)

#### Defined in

[src/lib/table/data/options/table-options.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L112)

___

### resizeEventDebounceDelay

• **resizeEventDebounceDelay**: `number` = `500`

The delay in milliseconds used for debouncing the resize event.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[resizeEventDebounceDelay](../interfaces/TableOptionsIf.md#resizeeventdebouncedelay)

#### Defined in

[src/lib/table/data/options/table-options.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L84)

___

### rowDragOptions

• `Optional` **rowDragOptions**: `Partial`\<[`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)\> = `undefined`

Row drag: managed or events only, multi-row drag, tree drop, auto-scroll (see [RowDragOptionsIf](../interfaces/RowDragOptionsIf.md)). The drag
handles come from [ColumnDefIf.rowDrag](../interfaces/ColumnDefIf.md#rowdrag). Fields you leave out keep their default ([RowDragOptions](RowDragOptions.md)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  rowDragOptions: { managed: false },   // only events – e.g. the server decides
};
```

**`Since`**

1.1.95

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[rowDragOptions](../interfaces/TableOptionsIf.md#rowdragoptions)

#### Defined in

[src/lib/table/data/options/table-options.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L113)

___

### shortcutActionIdMapping

• `Optional` **shortcutActionIdMapping**: [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

Own keyboard shortcuts: maps a shortcut (e.g. `"ctrl+c"`, `"f2"`) to an [ActionId](../modules.md#actionid).
Default: [WindowsShortcutActionIdMapping](WindowsShortcutActionIdMapping.md) resp. [OsxShortcutActionIdMapping](OsxShortcutActionIdMapping.md).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[shortcutActionIdMapping](../interfaces/TableOptionsIf.md#shortcutactionidmapping)

#### Defined in

[src/lib/table/data/options/table-options.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L81)

___

### shortcutActionsDisabled

• **shortcutActionsDisabled**: `boolean` = `false`

Switch off all keyboard shortcuts of the table (copy, select all, navigation, F2 …).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[shortcutActionsDisabled](../interfaces/TableOptionsIf.md#shortcutactionsdisabled)

#### Defined in

[src/lib/table/data/options/table-options.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L82)

___

### showCheckboxWihoutExtraColumn

• **showCheckboxWihoutExtraColumn**: `boolean` = `false`

Indicates whether to show checkbox without an extra column.
If true and the row is checkable, a checkbox is rendered in the first column.
If false and the row is checkable, a checkbox is rendered in an extra column left to the first column.

**`See`**

Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[showCheckboxWihoutExtraColumn](../interfaces/TableOptionsIf.md#showcheckboxwihoutextracolumn)

#### Defined in

[src/lib/table/data/options/table-options.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L76)

___

### sortOrder

• **sortOrder**: [`SortState`](../modules.md#sortstate)[]

The order of the sort states on repeated double-clicks on a header, default `["asc", "desc"]`.
Add `""` to get "unsorted" as third state. Per column: [ColumnDefIf.sortStatesOrder](../interfaces/ColumnDefIf.md#sortstatesorder).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[sortOrder](../interfaces/TableOptionsIf.md#sortorder)

#### Defined in

[src/lib/table/data/options/table-options.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L80)

___

### sortedOptions

• **sortedOptions**: [`SortedOptions`](SortedOptions.md)

The sort icons shown in sortable header cells.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[sortedOptions](../interfaces/TableOptionsIf.md#sortedoptions)

#### Defined in

[src/lib/table/data/options/table-options.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L79)

___

### tableBottomBorderVisible

• **tableBottomBorderVisible**: `boolean` = `true`

Specifies whether the bottom border of a table is visible.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[tableBottomBorderVisible](../interfaces/TableOptionsIf.md#tablebottombordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L53)

___

### tableTopBorderVisible

• **tableTopBorderVisible**: `boolean` = `true`

Indicates whether the top border of a table is visible or hidden.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[tableTopBorderVisible](../interfaces/TableOptionsIf.md#tabletopbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L52)

___

### treeOptions

• **treeOptions**: [`TreeOptions`](TreeOptions.md)

Icons and behaviour of tree tables (arrows, indentation). See [TreeOptionsIf](../interfaces/TreeOptionsIf.md).

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[treeOptions](../interfaces/TableOptionsIf.md#treeoptions)

#### Defined in

[src/lib/table/data/options/table-options.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L74)

___

### verticalBorderVisible

• **verticalBorderVisible**: `boolean` = `true`

Indicates whether the vertical border is visible.

#### Implementation of

[TableOptionsIf](../interfaces/TableOptionsIf.md).[verticalBorderVisible](../interfaces/TableOptionsIf.md#verticalbordervisible)

#### Defined in

[src/lib/table/data/options/table-options.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.ts#L46)
