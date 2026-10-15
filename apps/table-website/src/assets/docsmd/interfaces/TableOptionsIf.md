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
- [columnResizeHandleWidthInPx](TableOptionsIf.md#columnresizehandlewidthinpx)
- [columnsDraggable](TableOptionsIf.md#columnsdraggable)
- [columnsResizable](TableOptionsIf.md#columnsresizable)
- [defaultRowHeights](TableOptionsIf.md#defaultrowheights)
- [externalFilterFunction](TableOptionsIf.md#externalfilterfunction)
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
- [overflowX](TableOptionsIf.md#overflowx)
- [overflowY](TableOptionsIf.md#overflowy)
- [overlayOptions](TableOptionsIf.md#overlayoptions)
- [resizeEventDebounceDelay](TableOptionsIf.md#resizeeventdebouncedelay)
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

[src/lib/table/data/options/table-options.if.ts:311](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L311)

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

Training: [Accessible tables: keyboard and screen readers](https://gui.expert/training/accessibility/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:288](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L288)

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

[src/lib/table/data/options/table-options.if.ts:300](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L300)

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

[src/lib/table/data/options/table-options.if.ts:329](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L329)

___

### autoRestoreOptions

• `Optional` **autoRestoreOptions**: [`AutoRestoreOptionsIf`](AutoRestoreOptionsIf.md)\<`any`\>

Remember sorting, scroll position and expanded tree nodes in `localStorage`. Off by default.

**`See`**

 - [AutoRestoreOptions](../classes/AutoRestoreOptions.md)
 - Training: [Remember the state](https://gui.expert/training/persist-state/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:244](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L244)

___

### columnResizeHandleWidthInPx

• **columnResizeHandleWidthInPx**: `number`

The width of the column resize handle in pixels.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:170](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L170)

___

### columnsDraggable

• **columnsDraggable**: `boolean`

Flag indicating whether the columns are draggable.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L164)

___

### columnsResizable

• **columnsResizable**: `boolean`

Represents whether the columns are resizable.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L158)

___

### defaultRowHeights

• **defaultRowHeights**: [`DefaultRowHeightsIf`](DefaultRowHeightsIf.md)

Row heights of header, body and footer in px (default 34 / 34 / 34). Read by [TableFactory.createTableModel](../classes/TableFactory.md#createtablemodel)
when it creates the area models – pass the options there as `tableOptions`, too.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:190](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L190)

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

[src/lib/table/data/options/table-options.if.ts:227](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L227)

___

### fixedEastSeparatorBorderVisible

• **fixedEastSeparatorBorderVisible**: `boolean`

Determines whether the fixed east separator border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L94)

___

### fixedWestSeparatorBorderVisible

• **fixedWestSeparatorBorderVisible**: `boolean`

Indicates whether the fixed west separator border should be visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L100)

___

### footerSeparatorBorderVisible

• **footerSeparatorBorderVisible**: `boolean`

Indicates whether the footer separator border is visible or not.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L88)

___

### footerVerticalSeparator

• **footerVerticalSeparator**: `boolean`

Indicates whether a vertical separator should be displayed in the footer.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L184)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor for a cell, if the column has no own [ColumnDefIf.getEditRenderer](ColumnDefIf.md#geteditrenderer).
Default: a text input ([InputCellRenderer](../classes/InputCellRenderer.md)).

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L252)

___

### getFocusModel

• `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](FocusModelIf.md)\>

Returns the focus model of the table. Default: every table creates its own [FocusModel](../classes/FocusModel.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:267](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L267)

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

[src/lib/table/data/options/table-options.if.ts:264](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L264)

___

### headerGroupOptions

• **headerGroupOptions**: [`HeaderGroupOptionsIf`](HeaderGroupOptionsIf.md)

Icons of collapsible header groups ([AreaModelCellGroups](../classes/AreaModelCellGroups.md)).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:199](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L199)

___

### headerSeparatorBorderVisible

• **headerSeparatorBorderVisible**: `boolean`

Indicates whether the header separator border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L82)

___

### headerToggleExpandCollapseIcons

• **headerToggleExpandCollapseIcons**: `boolean`

Reserved – currently not evaluated (tree tables always show the expand-all / collapse-all icon in the top left header cell).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:193](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L193)

___

### headerVerticalSeparator

• **headerVerticalSeparator**: `boolean`

Represents whether a vertical separator should be displayed in a header.

**`Since`**

1.0.0

#### Defined in

[src/lib/table/data/options/table-options.if.ts:178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L178)

___

### horizontalBorderVisible

• **horizontalBorderVisible**: `boolean`

Represents the visibility of the horizontal border.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L112)

___

### hoverColumnVisible

• **hoverColumnVisible**: `boolean`

Flag indicating whether the hover color of a column is visible or not in general.
If true, the column get the hover background color while the mouse is over the column.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L152)

___

### hoverRowVisible

• **hoverRowVisible**: `boolean`

Flag indicating whether the hover color of a row is visible or not in general.
If true, the row get the hover background color while the mouse is over the row.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L145)

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

#### Defined in

[src/lib/table/data/options/table-options.if.ts:357](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L357)

___

### overflowX

• **overflowX**: ``"auto"`` \| ``"scroll"``

The value of the css `overflowX` determines the behavior of horizontal overflow for the table body (scroll port).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L119)

___

### overflowY

• **overflowY**: ``"auto"`` \| ``"scroll"``

The value of the css `overflowX` determines the behavior of vertical overflow for the table body (scroll port).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L125)

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

#### Defined in

[src/lib/table/data/options/table-options.if.ts:344](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L344)

___

### resizeEventDebounceDelay

• **resizeEventDebounceDelay**: `number`

The delay in milliseconds used for debouncing the resize event.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L75)

___

### shortcutActionIdMapping

• `Optional` **shortcutActionIdMapping**: [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

Own keyboard shortcuts: maps a shortcut (e.g. `"ctrl+c"`, `"f2"`) to an [ActionId](../modules.md#actionid).
Default: [WindowsShortcutActionIdMapping](../classes/WindowsShortcutActionIdMapping.md) resp. [OsxShortcutActionIdMapping](../classes/OsxShortcutActionIdMapping.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:273](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L273)

___

### shortcutActionsDisabled

• **shortcutActionsDisabled**: `boolean`

Switch off all keyboard shortcuts of the table (copy, select all, navigation, F2 …).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:276](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L276)

___

### showCheckboxWihoutExtraColumn

• **showCheckboxWihoutExtraColumn**: `boolean`

Indicates whether to show checkbox without an extra column.
If true and the row is checkable, a checkbox is rendered in the first column.
If false and the row is checkable, a checkbox is rendered in an extra column left to the first column.

**`See`**

Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)

#### Defined in

[src/lib/table/data/options/table-options.if.ts:208](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L208)

___

### sortOrder

• **sortOrder**: [`SortState`](../modules.md#sortstate)[]

The order of the sort states on repeated double-clicks on a header, default `["asc", "desc"]`.
Add `""` to get "unsorted" as third state. Per column: [ColumnDefIf.sortStatesOrder](ColumnDefIf.md#sortstatesorder).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:236](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L236)

___

### sortedOptions

• **sortedOptions**: [`SortedOptionsIf`](SortedOptionsIf.md)

The sort icons shown in sortable header cells.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L230)

___

### stateChangedDebounceDelay

• `Optional` **stateChangedDebounceDelay**: `number`

Delay in ms between the last change of the state (resize, sort, scroll …) and
[EventListenerIf.onStateChanged](EventListenerIf.md#onstatechanged) / the save of [autoRestoreOptions](TableOptionsIf.md#autorestoreoptions). Default 300.

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/table-options.if.ts:365](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L365)

___

### tableBottomBorderVisible

• **tableBottomBorderVisible**: `boolean`

Specifies whether the bottom border of a table is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:138](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L138)

___

### tableTopBorderVisible

• **tableTopBorderVisible**: `boolean`

Indicates whether the top border of a table is visible or hidden.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L132)

___

### treeOptions

• **treeOptions**: [`TreeOptionsIf`](TreeOptionsIf.md)

Icons and behaviour of tree tables (arrows, indentation). See [TreeOptionsIf](TreeOptionsIf.md).

#### Defined in

[src/lib/table/data/options/table-options.if.ts:196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L196)

___

### verticalBorderVisible

• **verticalBorderVisible**: `boolean`

Indicates whether the vertical border is visible.

#### Defined in

[src/lib/table/data/options/table-options.if.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/table-options.if.ts#L106)
