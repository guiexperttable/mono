[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableApi

# Class: TableApi

The public API of one table – everything you do with a table after it has been created:
scrolling, sorting, filtering, selection, copy, Excel export, updating cells and rows, repainting.

Every table has exactly one `TableApi`. You never create it yourself – you get it:

| Where | How |
|---|---|
| Plain TypeScript | `new TableScope(host, model, new SimpleDomService(), options, listener).firstInit().getApi()` |
| Web Component | `el.addEventListener("tableReady", e => e.detail)` |
| React / Preact / Solid | `<GuiexpertTable tableReady={api => …} />` |
| Vue 3 | `<GuiexpertTable @tableReady="api => …" />` |
| Svelte 5 | `<GuiexpertTable onTableReady={api => …} />` |
| Angular | `<guiexpert-table (tableReady)="onReady($event)" />` |

## The most important methods

| Task | Methods |
|---|---|
| scroll | [scrollToIndex](TableApi.md#scrolltoindex), [ensureRowIsVisible](TableApi.md#ensurerowisvisible), [ensureColumnIsVisible](TableApi.md#ensurecolumnisvisible), [scrollToPixel](TableApi.md#scrolltopixel), [getFirstVisibleRowIndex](TableApi.md#getfirstvisiblerowindex) |
| sort | [sortByColumn](TableApi.md#sortbycolumn), [sort](TableApi.md#sort), [reSort](TableApi.md#resort) |
| filter | [externalFilterChanged](TableApi.md#externalfilterchanged) (with [TableOptionsIf.externalFilterFunction](../interfaces/TableOptionsIf.md#externalfilterfunction)) |
| export | [copyToClipboard](TableApi.md#copytoclipboard), [downloadExcel](TableApi.md#downloadexcel) |
| change data | [updateCells](TableApi.md#updatecells), [setRows](TableApi.md#setrows), [addRows](TableApi.md#addrows), [updateRows](TableApi.md#updaterows), [removeRows](TableApi.md#removerows) |
| redraw | [repaint](TableApi.md#repaint) (same row count), [repaintHard](TableApi.md#repainthard) (row count or heights changed) |
| columns | [autoResizeColumns](TableApi.md#autoresizecolumns), [setColumnWidth](TableApi.md#setcolumnwidth), [recalcColumnWidths](TableApi.md#recalccolumnwidths), [getColumnIndex](TableApi.md#getcolumnindex) |
| tree | [expandAll](TableApi.md#expandall), [collapseAll](TableApi.md#collapseall), [setRowExpanded](TableApi.md#setrowexpanded) |
| state | [getState](TableApi.md#getstate), [applyState](TableApi.md#applystate), [resetState](TableApi.md#resetstate) (with [TableOptionsIf.autoRestoreOptions](../interfaces/TableOptionsIf.md#autorestoreoptions)) |
| lifecycle | [destroy](TableApi.md#destroy) |

**`Example`**

```ts
// plain TypeScript: create a table and talk to it
const tableModel = TableFactory.createTableModel({ rows: orders });
const tableApi = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter())
  .firstInit()
  .getApi();

tableApi.scrollToIndex(0, 50_000);                  // column 0, row 50,000
tableApi.sortByColumn("total", "desc");             // like a double-click on the header
await tableApi.copyToClipboard();                   // the current selection, tab-separated
await tableApi.downloadExcel("orders.xlsx");        // the current view as .xlsx
```

**`Example`**

```ts
// live data: change single cells, only the visible ones are redrawn
tableApi.updateCells([
  new TableCellUpdateEvent("body", 3, 2, 101.5, { "tick-up": true }),
  new TableCellUpdateEvent("body", 3, 3, 0.42)
]);
```

**`Example`**

```ts
// replace the rows of an object-array table – the row count changes, so repaint hard
tableApi.setRows(newOrders);
tableApi.externalFilterChanged();                   // only if a filter function is set
tableApi.repaintHard();
```

**`See`**

Training: [Your first table](https://gui.expert/training/first-table/),
  [Sorting](https://gui.expert/training/sorting/), [Filtering](https://gui.expert/training/filtering/),
  [Excel export](https://gui.expert/training/excel-export/), [Live data](https://gui.expert/training/live-data/)

## Table of contents

### Constructors

- [constructor](TableApi.md#constructor)

### Properties

- [tableScope](TableApi.md#tablescope)

### Methods

- [addRows](TableApi.md#addrows)
- [addRowsAt](TableApi.md#addrowsat)
- [announce](TableApi.md#announce)
- [applyState](TableApi.md#applystate)
- [autoResizeColumns](TableApi.md#autoresizecolumns)
- [clearSelection](TableApi.md#clearselection)
- [collapseAll](TableApi.md#collapseall)
- [copyToClipboard](TableApi.md#copytoclipboard)
- [destroy](TableApi.md#destroy)
- [downloadExcel](TableApi.md#downloadexcel)
- [ensureColumnIsVisible](TableApi.md#ensurecolumnisvisible)
- [ensureRowIsVisible](TableApi.md#ensurerowisvisible)
- [expandAll](TableApi.md#expandall)
- [externalFilterChanged](TableApi.md#externalfilterchanged)
- [findRowFromAllRowsByAllCriteria](TableApi.md#findrowfromallrowsbyallcriteria)
- [findRowFromFilteredRowsByAllCriteria](TableApi.md#findrowfromfilteredrowsbyallcriteria)
- [findRows](TableApi.md#findrows)
- [getBodyModel](TableApi.md#getbodymodel)
- [getColumnIndex](TableApi.md#getcolumnindex)
- [getDisplayedRowCount](TableApi.md#getdisplayedrowcount)
- [getFirstFullVisibleRowIndex](TableApi.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](TableApi.md#getfirstvisiblerowindex)
- [getHeaderFocus](TableApi.md#getheaderfocus)
- [getLastFullVisibleRowIndex](TableApi.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](TableApi.md#getlastvisiblerowindex)
- [getOverlayState](TableApi.md#getoverlaystate)
- [getPivotConfig](TableApi.md#getpivotconfig)
- [getRowGroupBy](TableApi.md#getrowgroupby)
- [getRowValue](TableApi.md#getrowvalue)
- [getSelectionAggregates](TableApi.md#getselectionaggregates)
- [getSelectionModel](TableApi.md#getselectionmodel)
- [getShortcutActionMapping](TableApi.md#getshortcutactionmapping)
- [getShowValuesAs](TableApi.md#getshowvaluesas)
- [getState](TableApi.md#getstate)
- [getTableModel](TableApi.md#gettablemodel)
- [getTableScope](TableApi.md#gettablescope)
- [hideOverlay](TableApi.md#hideoverlay)
- [isColumnVisible](TableApi.md#iscolumnvisible)
- [isFooterVisible](TableApi.md#isfootervisible)
- [isHeaderVisible](TableApi.md#isheadervisible)
- [isLoggingActive](TableApi.md#isloggingactive)
- [reSort](TableApi.md#resort)
- [recalcColumnWidths](TableApi.md#recalccolumnwidths)
- [recalcWrappers](TableApi.md#recalcwrappers)
- [removeRows](TableApi.md#removerows)
- [repaint](TableApi.md#repaint)
- [repaintHard](TableApi.md#repainthard)
- [resetState](TableApi.md#resetstate)
- [scrollToIndex](TableApi.md#scrolltoindex)
- [scrollToPixel](TableApi.md#scrolltopixel)
- [setColumnFormula](TableApi.md#setcolumnformula)
- [setColumnVisible](TableApi.md#setcolumnvisible)
- [setColumnWidth](TableApi.md#setcolumnwidth)
- [setCustomState](TableApi.md#setcustomstate)
- [setFooterVisible](TableApi.md#setfootervisible)
- [setHeaderGroupCollapsed](TableApi.md#setheadergroupcollapsed)
- [setHeaderVisible](TableApi.md#setheadervisible)
- [setLoggingActive](TableApi.md#setloggingactive)
- [setPivotConfig](TableApi.md#setpivotconfig)
- [setRowExpanded](TableApi.md#setrowexpanded)
- [setRowGroupBy](TableApi.md#setrowgroupby)
- [setRows](TableApi.md#setrows)
- [setSelectionModel](TableApi.md#setselectionmodel)
- [setShowValuesAs](TableApi.md#setshowvaluesas)
- [showLoadingOverlay](TableApi.md#showloadingoverlay)
- [showNoRowsOverlay](TableApi.md#shownorowsoverlay)
- [sort](TableApi.md#sort)
- [sortByColumn](TableApi.md#sortbycolumn)
- [triggerAction](TableApi.md#triggeraction)
- [updateCells](TableApi.md#updatecells)
- [updateRows](TableApi.md#updaterows)

## Constructors

### constructor

• **new TableApi**(`tableScope`): [`TableApi`](TableApi.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`TableApi`](TableApi.md)

#### Defined in

[src/lib/table/table-api.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L93)

## Properties

### tableScope

• `Readonly` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/table-api.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L94)

## Methods

### addRows

▸ **addRows**\<`T`\>(`rows`): `void`

Adds new rows to the end of the table body.

Only works with an [AreaModelObjectArray](AreaModelObjectArray.md) body – logs a console warning otherwise.
Does **not** repaint and resets filtering and sorting of the body: afterwards call
[externalFilterChanged](TableApi.md#externalfilterchanged) (if a filter function is set) and [repaintHard](TableApi.md#repainthard) (the row count changed).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements in the rows array |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | An array of data objects to append to the table's existing rows |

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

This method appends the provided array of data objects to the end of the existing rows in the table body.
It only works with tables that use AreaModelObjectArray as their body model.

**`Example`**

```ts
tableApi.addRows([{ id: 100_001, customer: "New GmbH" }]);
tableApi.repaintHard();
tableApi.ensureRowIsVisible(tableApi.getDisplayedRowCount() - 1);
```

#### Defined in

[src/lib/table/table-api.ts:1231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1231)

___

### addRowsAt

▸ **addRowsAt**\<`T`\>(`rows`, `rowIndex`): `void`

Inserts new rows at a specific position in the table body.

Only works with an [AreaModelObjectArray](AreaModelObjectArray.md) body – logs a console warning otherwise.
Does **not** repaint and resets filtering and sorting of the body: afterwards call
[externalFilterChanged](TableApi.md#externalfilterchanged) (if a filter function is set) and [repaintHard](TableApi.md#repainthard) (the row count changed).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements in the rows array |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | An array of data objects to insert into the table |
| `rowIndex` | `number` | The index position where the new rows should be inserted |

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

This method inserts the provided array of data objects at the specified index position in the table body.
Existing rows at or after the specified index will be shifted down.
It only works with tables that use AreaModelObjectArray as their body model.

#### Defined in

[src/lib/table/table-api.ts:1260](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1260)

___

### announce

▸ **announce**(`text`): `void`

Speaks a message to screen reader users through the live region of the table (`role="status"`,
polite – it does not interrupt). The table itself announces sorting, filter results, copying and
"select all"; use this for your own events, e.g. after loading or saving data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | plain text (not HTML) |

#### Returns

`void`

**`Example`**

```ts
fetch("/api/orders").then(r => r.json()).then(orders => {
  tableApi.setRows(orders);
  tableApi.announce(`${orders.length} orders loaded`);
});
```

**`Since`**

1.1.91

**`See`**

Training: [Accessible tables: keyboard and screen readers](https://gui.expert/training/accessibility/)

#### Defined in

[src/lib/table/table-api.ts:727](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L727)

___

### applyState

▸ **applyState**(`state`, `parts?`): `void`

Applies a state from [getState](TableApi.md#getstate) (or one written by hand) and repaints. Only the parts contained in the
state are applied (optionally only the given ones); the others stay as they are – pass a part empty to reset it,
e.g. `sort: []` (clears the sort icons; the rows keep their current order). Unknown columns and rows are ignored. The change is stored ([TableOptionsIf.autoRestoreOptions](../interfaces/TableOptionsIf.md#autorestoreoptions))
and reported ([EventListenerIf.onStateChanged](../interfaces/EventListenerIf.md#onstatechanged)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `Partial`\<[`TableStateIf`](../interfaces/TableStateIf.md)\> | the state |
| `parts?` | [`TableStatePart`](../modules.md#tablestatepart)[] | only these parts, default: all parts of the state |

#### Returns

`void`

**`Example`**

```ts
// two saved views of the same table
const views: Record<string, TableStateIf> = {};
views["compact"] = tableApi.getState(["columns"]);
tableApi.applyState(views["compact"]);
```

**`Example`**

```ts
tableApi.applyState({ sort: [{ property: "total", sortState: "desc" }] });
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:851](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L851)

___

### autoResizeColumns

▸ **autoResizeColumns**(`recalcWrappers?`): `void`

Automatically resizes all columns to fit their content.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `recalcWrappers` | `boolean` | `true` | Determines whether to recalculate wrapper dimensions after resizing columns. Default value is true. |

#### Returns

`void`

- This method doesn't return anything.

#### Defined in

[src/lib/table/table-api.ts:1133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1133)

___

### clearSelection

▸ **clearSelection**(): `void`

Clears the current selection in the table.

This method removes any selected cells, rows, or columns in the table.
It provides a convenient way to programmatically clear all selections in the table
without having to access the underlying selection model directly.

When called, this method delegates to the table scope's clearSelection method with
a parameter value of true, which ensures the table is automatically repainted after
the selection is cleared.

#### Returns

`void`

**`Example`**

```ts
// Clear all selections in the table (e.g. from a "reset" button)
tableApi.clearSelection();
```

#### Defined in

[src/lib/table/table-api.ts:580](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L580)

___

### collapseAll

▸ **collapseAll**(): `void`

Tree tables: collapses every row on every level and repaints. No effect for other tables.

#### Returns

`void`

**`Example`**

```ts
tableApi.collapseAll();
```

#### Defined in

[src/lib/table/table-api.ts:1549](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1549)

___

### copyToClipboard

▸ **copyToClipboard**(): `Promise`\<`string`\>

Copies the selected data from the table to the clipboard.

This method leverages the copyService to extract and copy the currently selected data
from the table. It works with the current selection state and focus position to determine
what content should be copied.

The copied data is formatted as tab-separated text that can be pasted into spreadsheet
applications like Excel or text editors while maintaining the tabular structure.
Screen readers hear "12 cells copied" ([AriaTextsIf.copied](../interfaces/AriaTextsIf.md#copied)).

#### Returns

`Promise`\<`string`\>

A promise that resolves with the copied data as a string.
  The string contains the tab-separated representation of the selected table data.

**`Example`**

```ts
// Copy the currently selected data to clipboard
tableApi.copyToClipboard().then(content => {
  console.log('Copied to clipboard:', content);
});

// Using with a button click handler
function onCopyButtonClick() {
  if (tableApi) {
    tableApi.copyToClipboard()
      .then(content => {
        console.log('Successfully copied data to clipboard');
        // Optionally do something with the copied content
      })
      .catch(error => {
        console.error('Failed to copy to clipboard:', error);
      });
  }
}
```

#### Defined in

[src/lib/table/table-api.ts:701](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L701)

___

### destroy

▸ **destroy**(): `void`

Releases the table: removes all DOM listeners (incl. the window resize listener), stops the
resize observer, calls the cleanup functions of all cell renderers and clears the host element.
The framework wrappers call it automatically when they are unmounted or receive a new table model.

#### Returns

`void`

**`Example`**

```ts
// Plain TS: replace the table with a new model
tableApi.destroy();
const scope = new TableScope(hostDiv, newModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
scope.firstInit();
```

#### Defined in

[src/lib/table/table-api.ts:499](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L499)

___

### downloadExcel

▸ **downloadExcel**(`fileName?`, `author?`): `Promise`\<`void`\>

Downloads the current table data as an Excel file.

This method extracts all visible data from the table (including header, body, and footer areas),
converts it into a matrix format, and triggers a download of an Excel file containing this data.

The method works by:
1. Creating an empty matrix to hold all table data
2. Iterating through each area of the table (header, body, footer)
3. For each area, iterating through all rows and columns to extract cell values
4. Passing the complete data matrix to the Excel service for file generation and download

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `fileName` | `string` | `'table.xlsx'` | The name of the Excel file to be downloaded (default: 'table.xlsx') |
| `author` | `string` | `''` | Optional metadata for the Excel file to specify the author (default: '') |

#### Returns

`Promise`\<`void`\>

resolves when the (compressed) file has been handed to the browser

**`Example`**

```ts
// Download table data with default filename
tableApi.downloadExcel();
```

**`Example`**

```ts
// Download table data with custom filename and author
tableApi.downloadExcel('sales-report.xlsx', 'John Doe');
```

**`Example`**

```ts
// Download table data with custom filename only
tableApi.downloadExcel('quarterly-data.xlsx');
```

#### Defined in

[src/lib/table/table-api.ts:957](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L957)

___

### ensureColumnIsVisible

▸ **ensureColumnIsVisible**(`columnIndex`): `boolean`

Ensures that a column is fully visible by scrolling horizontally if necessary – the counterpart of
[ensureRowIsVisible](TableApi.md#ensurerowisvisible). A column left of the viewport becomes the first visible column, a column right of it
the last one. The vertical position is kept. The arrow keys use it for the focused cell.

Fixed columns (`fixedLeftColumnCount` / `fixedRightColumnCount`) are always visible, hidden columns
([setColumnVisible](TableApi.md#setcolumnvisible)) can't be scrolled to: both return `false`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The column index (model index over west + center + east) |

#### Returns

`boolean`

true if the table was scrolled, false if the column was already visible

**`Example`**

```ts
// show the column of a search hit (rowIndex/columnIndex from your own search)
const rowIndex = 1200, columnIndex = 14;
tableApi.ensureColumnIsVisible(columnIndex);
tableApi.ensureRowIsVisible(rowIndex);
```

**`See`**

[scrollToIndex](TableApi.md#scrolltoindex) - scrolls a column and row to the top left

#### Defined in

[src/lib/table/table-api.ts:1849](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1849)

___

### ensureRowIsVisible

▸ **ensureRowIsVisible**(`rowIndex`): `boolean`

Ensures that a specific row is visible in the viewport by scrolling if necessary.
This method checks if the target row is within the currently visible range and
adjusts the scroll position if it's not visible.

The method performs the following:
1. Checks if the row is above the current viewport (before first visible row)
2. Checks if the row is below the current viewport (after last visible row)
3. Scrolls to make the row visible if needed

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to make visible |

#### Returns

`boolean`

Returns true if scrolling was needed and performed, false if the row was already visible

**`Example`**

```ts
// Ensure row 5 is visible in the viewport
tableApi.ensureRowIsVisible(5);
```

**`Throws`**

Implicitly may throw if rowIndex is not a number or if required properties are undefined

**`See`**

 - [scrollToIndex](TableApi.md#scrolltoindex) - The underlying method used for scrolling
 - [getDisplayedRowCount](TableApi.md#getdisplayedrowcount) - Related method for getting visible row count

#### Defined in

[src/lib/table/table-api.ts:1826](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1826)

___

### expandAll

▸ **expandAll**(): `void`

Tree tables: expands every row on every level (like the "expand all" icon in the header) and repaints.
No effect for other tables.

#### Returns

`void`

**`Example`**

```ts
document.querySelector("#expand")!.addEventListener("click", () => tableApi.expandAll());
```

#### Defined in

[src/lib/table/table-api.ts:1539](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1539)

___

### externalFilterChanged

▸ **externalFilterChanged**(): `void`

Notifies the table that an external filter has been changed and needs to be applied.

This method is used when an external filter condition (defined by `tableOptions.externalFilterFunction`)
has changed and the table needs to refresh its display to reflect the new filtering criteria.

When called, this method:
1. Applies the external filter function to all rows
2. Clears the current selection (by default)
3. Scrolls to the top of the table
4. Recalculates table dimensions
5. Repaints the table to display only the filtered rows

#### Returns

`void`

**`Example`**

```typescript
// Define an external filter function in your table options
const tableOptions = {
  externalFilterFunction: (row: MyRowType) => {
    // Return true to include the row, false to filter it out
    return row.status === 'active';
  }
};

// Initialize your table with these options
const tableApi = new TableApi(tableScope);

// Later, when filter criteria change (e.g., in a search input handler)
function onFilterTextChanged() {
  // Update the filter function if needed
  tableOptions.externalFilterFunction = (row: MyRowType) => {
    return row.name.includes(searchText);
  };

  // Apply the updated filter
  tableApi.externalFilterChanged();
}
```

**`See`**

TableScope.externalFilterChanged

#### Defined in

[src/lib/table/table-api.ts:229](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L229)

___

### findRowFromAllRowsByAllCriteria

▸ **findRowFromAllRowsByAllCriteria**\<`T`\>(`criteria`, `predicate`): `undefined` \| `T`

Searches through all rows in the table's body model to find a row that matches specified criteria.
This method works only with AreaModelObjectArray<T> body models.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of objects/rows in the table |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `criteria` | `Partial`\<`T`\> | A partial object containing the search criteria. Only needs to include the properties you want to match against. |
| `predicate` | (`criteria`: `Partial`\<`T`\>, `row`: `T`) => `boolean` | A function that defines how to match rows against the criteria. Returns true if the row matches the criteria, false otherwise. |

#### Returns

`undefined` \| `T`

The first matching row, or undefined if no match is found or if the body model is not AreaModelObjectArray.

**`Example`**

```ts
// Find a user row by id and name
const criteria = { id: 1, name: "John" };
const user = tableApi.findRowFromAllRowsByAllCriteria(criteria, 
  (criteria, row) => row.id === criteria.id && row.name === criteria.name
);
```

**`Example`**

```ts
// Find a product row with partial match on name
const criteria = { name: "Phone" };
const product = tableApi.findRowFromAllRowsByAllCriteria(criteria,
  (criteria, row) => row.name.includes(criteria.name!)
);
```

**`Example`**

```ts
// Find an order with complex matching logic
const criteria = { total: 100, status: "paid" as const };
const order = tableApi.findRowFromAllRowsByAllCriteria<Order>(criteria,
  (criteria, row) => {
    return row.total > criteria.total! &&
           row.status === criteria.status;
  }
);
```

**`Throws`**

Logs a warning to console if the body model is not an instance of AreaModelObjectArray

#### Defined in

[src/lib/table/table-api.ts:1445](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1445)

___

### findRowFromFilteredRowsByAllCriteria

▸ **findRowFromFilteredRowsByAllCriteria**\<`T`\>(`criteria`, `predicate`): `undefined` \| `T`

Searches through the filtered rows of the table to find a row that matches specific criteria.
This method only works with tables that use AreaModelObjectArray as their body model.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of the row objects in the table |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `criteria` | `Partial`\<`T`\> | A partial object containing the search criteria. Only needs to include the properties you want to match against. |
| `predicate` | (`criteria`: `Partial`\<`T`\>, `row`: `T`) => `boolean` | A function that defines how to match rows against the criteria. Returns true if the row matches the criteria, false otherwise. |

#### Returns

`undefined` \| `T`

The first matching row from the filtered rows, or undefined if no match is found
                        or if the body model is not an instance of AreaModelObjectArray.

**`Example`**

```typescript
interface Person {
  id: number;
  name: string;
  age: number;
}

// Find a person by exact match
const criteria = { name: "John", age: 30 };
const person = tableApi.findRowFromFilteredRowsByAllCriteria<Person>(
  criteria,
  (criteria, row) => row.name === criteria.name && row.age === criteria.age
);

// Find a person by partial name match
const searchCriteria = { name: "Jo" };
const person2 = tableApi.findRowFromFilteredRowsByAllCriteria<Person>(
  searchCriteria,
  (criteria, row) => row.name.toLowerCase().includes(criteria.name!.toLowerCase())
);

```

**`Throws`**

Logs a warning to console if the body model is not an instance of AreaModelObjectArray

**`Remarks`**

- This method only searches through filtered rows (rows that are currently visible in the table)
- If you need to search through all rows (including filtered out ones), use findRowFromAllRowsByAllCriteria instead
- The predicate function gives you full control over how to match rows against your criteria
- Returns undefined if either no match is found or if the table's body model is not compatible

#### Defined in

[src/lib/table/table-api.ts:1392](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1392)

___

### findRows

▸ **findRows**\<`T`\>(`rows`, `predicate?`): `T`[]

Searches for and returns rows from the table body that match the given criteria.

Only works with an [AreaModelObjectArray](AreaModelObjectArray.md) body – logs a console warning otherwise.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements in the rows array |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | An array of rows to search for in the table body |
| `predicate` | (`a`: `T`, `b`: `T`) => `boolean` | A comparison function that determines if two rows match - Default predicate uses strict equality (===) - The function should return true if the rows are considered a match - Parameters: - a: The row from the table body being checked - b: The row from the input array being searched for |

#### Returns

`T`[]

An array containing all matching rows found in the table body
  - Returns an empty array if:
    - The body model is not an instance of AreaModelObjectArray
    - No matches are found

**`Description`**

This method searches through the table body model for rows that match the provided criteria.
It only works with tables that use AreaModelObjectArray as their body model.
The method uses a predicate function to determine matches between rows.

**`Example`**

```ts
// Find rows with simple equality comparison
const matchingRows = tableApi.findRows([orders[0], orders[1]]);
```

**`Example`**

```ts
// Find rows with custom comparison logic
const matchingRows = tableApi.findRows<Order>([{ ...orders[0] }], (a, b) => a.id === b.id);
```

#### Defined in

[src/lib/table/table-api.ts:1334](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1334)

___

### getBodyModel

▸ **getBodyModel**(): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Retrieves the area model for the body section of the table.

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

The area model interface that provides access to the table's body data,
                      including rows, cells, and their values.

#### Defined in

[src/lib/table/table-api.ts:1178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1178)

___

### getColumnIndex

▸ **getColumnIndex**(`property`): `number`

The index of the column that shows a property – `-1` if there is none.

Column indices count all columns, also a [RowNumberColumnDef](RowNumberColumnDef.md) or [CheckboxColumnDef](CheckboxColumnDef.md) in front:
with row numbers (`rowNumbersVisible: true`) every data column has an index one higher. Get the index by the
property instead of writing numbers into your code.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the property of the column definition, e.g. `"total"` |

#### Returns

`number`

the column index (fixed columns included) or -1

**`Example`**

```ts
const totalColumn = tableApi.getColumnIndex("total");
tableApi.scrollToIndex(totalColumn, 0);
```

**`Since`**

1.1.93

#### Defined in

[src/lib/table/table-api.ts:1022](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1022)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

Retrieves the number of rows currently displayed in the table.

#### Returns

`number`

The number of rows currently displayed in the table.

**`Description`**

This method returns the count of rows that are currently visible in the table after
applying any filtering, pagination, or other visibility constraints.

#### Defined in

[src/lib/table/table-api.ts:1862](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1862)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

Retrieves the index of the first fully visible row in the table's viewport.

A row is considered "fully visible" when it's completely within the visible area of the table.
This differs from the regular "visible" row, which might be partially visible at the edges of the viewport.

This method is useful for:
- Determining which rows are completely in view for operations that require full visibility
- Implementing pagination or virtualization logic that needs to know complete row visibility
- Supporting keyboard navigation that should skip partially visible rows

#### Returns

`number`

The index of the first fully visible row, or -1 if no rows are fully visible

**`Example`**

```ts
// Get the first fully visible row index
const firstFullVisibleRow = tableApi.getFirstFullVisibleRowIndex();

// Check if a specific row is fully visible
const isRowFullyVisible = (rowIndex: number) => {
  const firstFullVisible = tableApi.getFirstFullVisibleRowIndex();
  const lastFullVisible = tableApi.getLastFullVisibleRowIndex();
  return rowIndex >= firstFullVisible && rowIndex <= lastFullVisible;
};
```

#### Defined in

[src/lib/table/table-api.ts:1925](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1925)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

Returns the index of the first visible row in the table's viewport.

This method retrieves the first visible row index from the table's scope, which is useful
for virtual scrolling and viewport-related calculations. The index represents the topmost
visible row in the current scroll position of the table.

This value is maintained internally by the table and updated during scrolling operations.
It's particularly important for:
- Virtual scrolling optimization
- Calculating visible range of rows
- Viewport-related operations
- Scroll position restoration

#### Returns

`number`

The index of the first visible row in the table's viewport.
                  Returns -1 if no rows are visible or if the table is not yet rendered.

**`Example`**

```typescript
// Get the first visible row index
const tableApi = new TableApi(tableScope);
const firstVisibleIndex = tableApi.getFirstVisibleRowIndex();

// Use the index for scroll position calculations
if (firstVisibleIndex >= 0) {
  // Perform operations with the first visible row
  console.log(`First visible row index: ${firstVisibleIndex}`);
}
```

#### Defined in

[src/lib/table/table-api.ts:1897](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1897)

___

### getHeaderFocus

▸ **getHeaderFocus**(): `undefined` \| [`number`, `number`]

The header cell that has the keyboard focus. Arrow up in the first body row moves the focus into the header
(Enter sorts or opens/closes a header group there); arrow down leaves it. The [FocusModelIf](../interfaces/FocusModelIf.md) holds
the body focus only and is not changed by this.

#### Returns

`undefined` \| [`number`, `number`]

header row index and column index, `undefined` if the focus is in the body

**`Example`**

```ts
const headerFocus = tableApi.getHeaderFocus();
if (headerFocus) {
  const [headerRow, column] = headerFocus;
  console.log(`header cell ${headerRow}/${column} has the focus`);
}
```

**`Since`**

1.1.91

#### Defined in

[src/lib/table/table-api.ts:924](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L924)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

Returns the index of the last fully visible row in the table's viewport.

This method retrieves the last row that is completely visible within the current
viewport of the table. A row is considered "fully visible" when its entire height
is visible without any portion being cut off by the viewport boundaries.

The distinction between "visible" and "fully visible" is important when scrolling:
- A row can be partially visible (some portion is in view)
- A row can be fully visible (the entire row is in view)

#### Returns

`number`

The index of the last fully visible row in the table.
If no row is fully visible or the table is empty, the method might return -1.

**`Example`**

```typescript
// Get the index of the last fully visible row
const lastVisibleRowIndex = tableApi.getLastFullVisibleRowIndex();

// Use this information to determine if a specific row is fully visible
const isRowFullyVisible = rowIndex <= lastVisibleRowIndex && rowIndex >= tableApi.getFirstFullVisibleRowIndex();

// Can be used with scrolling operations to ensure certain rows are visible
if (rowIndex > lastVisibleRowIndex) {
  tableApi.ensureRowIsVisible(rowIndex);
}
```

#### Defined in

[src/lib/table/table-api.ts:1989](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1989)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

Returns the index of the last row that is visible in the table's viewport.

This method retrieves the last visible row index from the table scope, which keeps
track of which rows are currently visible as the user scrolls through the table.

This can be useful for:
- Implementing virtualized scrolling optimizations
- Determining if specific rows are currently in view
- Implementing features that need to know the visible range of rows

#### Returns

`number`

The index of the last visible row in the table viewport

**`Example`**

```ts
// Check if a specific row is currently visible in the viewport
const lastVisibleIndex = tableApi.getLastVisibleRowIndex();
const firstVisibleIndex = tableApi.getFirstVisibleRowIndex();
const isRowVisible = rowIndex >= firstVisibleIndex && rowIndex <= lastVisibleIndex;
```

**`Example`**

```ts
// Get the range of visible rows
const visibleRowsRange = {
  first: tableApi.getFirstVisibleRowIndex(),
  last: tableApi.getLastVisibleRowIndex()
};
console.log(`Visible rows: ${visibleRowsRange.first} to ${visibleRowsRange.last}`);
```

#### Defined in

[src/lib/table/table-api.ts:1957](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1957)

___

### getOverlayState

▸ **getOverlayState**(): [`GeOverlayKind`](../modules.md#geoverlaykind)

The overlay shown now: `"none"`, `"loading"`, `"noRows"` or `"noMatches"`. During
[OverlayOptionsIf.loadingDelayInMs](../interfaces/OverlayOptionsIf.md#loadingdelayinms) the loading overlay is requested but not shown yet – the automatic
overlay stays meanwhile (e.g. `"noRows"` of an empty table), so a fast answer causes no flicker.

#### Returns

[`GeOverlayKind`](../modules.md#geoverlaykind)

the shown overlay

**`Example`**

```ts
if (tableApi.getOverlayState() === "noMatches") {
  resetFilterButton.hidden = false;
}
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:801](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L801)

___

### getPivotConfig

▸ **getPivotConfig**(): `undefined` \| [`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`any`\>

Pivot table: the current configuration.

#### Returns

`undefined` \| [`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`any`\>

a copy, undefined if the table model is no pivot table

**`Example`**

```ts
const columnFields = tableApi.getPivotConfig()?.columnFields;   // ["monat"]
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/table-api.ts:1642](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1642)

___

### getRowGroupBy

▸ **getRowGroupBy**(): `undefined` \| [`RowGroupField`](../modules.md#rowgroupfield)[]

Row grouping: the current levels.

#### Returns

`undefined` \| [`RowGroupField`](../modules.md#rowgroupfield)[]

the levels, undefined if the body is no row grouping

**`Example`**

```ts
const levels = tableApi.getRowGroupBy();   // ["region", "produkt"]
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/table-api.ts:1601](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1601)

___

### getRowValue

▸ **getRowValue**(`row`, `property`): `unknown`

The value of a column for a row object – computed for a calculated column (`valueGetter`, `formula`), otherwise
the property (path). Use it in the external filter to filter by calculated values; a `TreeRow` is unwrapped.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `any` | a row object (or the `TreeRow` a tree filter gets) |
| `property` | `string` | the property of the column |

#### Returns

`unknown`

the value (a [FormulaError](FormulaError.md) for a formula error)

**`Example`**

```ts
tableOptions.externalFilterFunction = (row: Item) => Number(tableApi.getRowValue(row, "total")) > 500;
tableApi.externalFilterChanged();
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/table-api.ts:1661](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1661)

___

### getSelectionAggregates

▸ **getSelectionAggregates**(): [`SelectionAggregatesIf`](../interfaces/SelectionAggregatesIf.md)

Count, sum, average, minimum and maximum of the selected body cells – for a status bar like in a spreadsheet.
Counted are the selected cells of the visible data columns; the numbers are the cell values of type `number`.
Above [SelectionAggregator.maxCells](SelectionAggregator.md#maxcells) cells (default 1,000,000) nothing is computed (`capped: true`).
Without a selection all values are 0 / `undefined`.

#### Returns

[`SelectionAggregatesIf`](../interfaces/SelectionAggregatesIf.md)

`{ count, numericCount, sum, avg, min, max, capped }`

**`Example`**

```ts
// a status bar in plain HTML under the table
const statusBar = document.querySelector<HTMLDivElement>("#status")!;
const listener = new EventAdapter();
listener.onSelectionChanged = () => {
  const a = tableApi.getSelectionAggregates();
  statusBar.textContent = a.capped ? "Selection too large"
    : a.numericCount ? `Count ${a.count} · Sum ${formatAggregateValue(a.sum)} · Average ${formatAggregateValue(a.avg)}`
    : "";
};
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/table-api.ts:1119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1119)

___

### getSelectionModel

▸ **getSelectionModel**(): `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

Returns the current selection model for the table.

The selection model manages cell selection state, including single cells, ranges, rows, and columns.
This method provides access to the selection model instance, allowing operations like:
- Checking if cells are selected
- Getting selection ranges
- Modifying selections
- Adding/removing selection event listeners

#### Returns

`undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

The current selection model if available, otherwise undefined.

**`Example`**

```ts
// Get the selection model
const selectionModel = tableApi.getSelectionModel();

// Check if a specific cell is selected
if (selectionModel?.isSelected(3, 2)) {
  console.log('Cell at row 3, column 2 is selected');
}

// Get all selected ranges
const ranges = selectionModel?.getRanges();
console.log('Selected ranges:', ranges);

// Clear all selections
selectionModel?.clear();

// Toggle selection of a cell
selectionModel?.togglePoint(5, 1);

// Add a selection change listener
selectionModel?.addEventSelectionChangedListener({
  onSelectionChanged: () => {
    console.log('Selection has changed');
  }
});
```

#### Defined in

[src/lib/table/table-api.ts:1094](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1094)

___

### getShortcutActionMapping

▸ **getShortcutActionMapping**(): [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

Retrieves the shortcut action mapping from the table's shortcut service.

This method provides access to the keyboard shortcut configuration that defines
which keys trigger specific actions in the table. The mapping contains key-value
pairs where:
- Keys are string representations of keyboard shortcuts (e.g., "ctrl+c", "shift+arrow_down")
- Values are ActionId values representing the corresponding table actions

This mapping can be useful for:
- Displaying available shortcuts to users
- Creating custom shortcut documentation
- Dynamically checking which actions are available via keyboard
- Extending or integrating with the table's shortcut system

#### Returns

[`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

An object mapping shortcut key combinations to their corresponding action IDs.
         For example: { "ctrl+c": "COPY_2_CLIPBOARD", "arrow_down": "NAVIGATE_DOWN" }

**`Example`**

```ts
// Get all available shortcuts in the table
const shortcuts = tableApi.getShortcutActionMapping();

// Check if a specific shortcut exists
if (shortcuts["ctrl+c"]) {
  console.log("Copy shortcut is available with action:", shortcuts["ctrl+c"]);
}

// Display available shortcuts in the UI
Object.entries(shortcuts).forEach(([key, actionId]) => {
  console.log(`${key}: ${actionId}`);
});
```

#### Defined in

[src/lib/table/table-api.ts:661](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L661)

___

### getShowValuesAs

▸ **getShowValuesAs**(`property`): `undefined` \| [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig)

„Show values as“ of a column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the property of the column |

#### Returns

`undefined` \| [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig)

the configuration, `undefined` for none

**`Example`**

```ts
const mode = tableApi.getShowValuesAs("total");   // "percentOfColumnTotal"
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/table-api.ts:1711](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1711)

___

### getState

▸ **getState**(`parts?`): [`TableStateIf`](../interfaces/TableStateIf.md)

The state of the table as plain JSON: column layout (order, widths, visibility), sorting, scroll position,
expanded tree nodes, checked and selected rows, header groups and your own data ([setCustomState](TableApi.md#setcustomstate)).
Columns are identified by property and rows by id ([AutoRestoreOptionsIf.getRowId](../interfaces/AutoRestoreOptionsIf.md#getrowid)), never by index.
Parts that do not apply to this table are left out (e.g. `tree` for a flat table).

Store it wherever you like and give it back with [applyState](TableApi.md#applystate) or [TableOptionsIf.initialState](../interfaces/TableOptionsIf.md#initialstate);
[TableOptionsIf.autoRestoreOptions](../interfaces/TableOptionsIf.md#autorestoreoptions) does this for you in `localStorage`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `parts?` | [`TableStatePart`](../modules.md#tablestatepart)[] | only these parts, default: all |

#### Returns

[`TableStateIf`](../interfaces/TableStateIf.md)

the state

**`Example`**

```ts
const state = tableApi.getState();                       // { version: 1, columns: [...], sort: [...], ... }
await fetch("/api/prefs/orders", { method: "PUT", body: JSON.stringify(state) });
```

**`Example`**

```ts
const layout = tableApi.getState(["columns", "sort"]);   // only the layout, no scroll position or selection
```

**`See`**

Training: [Remember the state](https://gui.expert/training/persist-state/)

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:827](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L827)

___

### getTableModel

▸ **getTableModel**(): [`TableModelIf`](../interfaces/TableModelIf.md)

Retrieves the table model that contains all data and structure information for the table.

#### Returns

[`TableModelIf`](../interfaces/TableModelIf.md)

The table model interface that provides access to the table's data structure,
                       including header, body, and footer area models.

#### Defined in

[src/lib/table/table-api.ts:1168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1168)

___

### getTableScope

▸ **getTableScope**(): [`TableScope`](TableScope.md)

Returns the TableScope instance associated with this TableApi.

The TableScope provides access to the core functionality and internal state of the table component,
including rendering, event handling, selection, and other low-level operations.

This method is useful for advanced customization scenarios where you need direct access
to the table's internal structure and behaviors.

#### Returns

[`TableScope`](TableScope.md)

The TableScope instance that controls this table component

**`Example`**

```ts
// Access the TableScope to perform a custom operation
const tableApi = new TableApi(myTableScope);
const tableScope = tableApi.getTableScope();

// Example: Manually trigger a context menu at a specific location
const mouseEvent = new MouseEvent('contextmenu');
const geMouseEvent = tableScope.createGeMouseEvent(mouseEvent);
tableScope.contextmenu(geMouseEvent);
```

#### Defined in

[src/lib/table/table-api.ts:1051](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1051)

___

### hideOverlay

▸ **hideOverlay**(): `void`

Ends the overlay shown by [showLoadingOverlay](TableApi.md#showloadingoverlay) or [showNoRowsOverlay](TableApi.md#shownorowsoverlay).
"No rows to show" / "No matching rows" are not ended: they show the state of the body and stay as long as it
is empty (switch them off with `overlayOptions: { autoNoRows: false }`).

#### Returns

`void`

**`Example`**

```ts
tableApi.showLoadingOverlay("Saving…");
save(order).finally(() => tableApi.hideOverlay());
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:784](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L784)

___

### isColumnVisible

▸ **isColumnVisible**(`column`): `boolean`

Returns whether a column is visible ([ColumnDefIf.isVisible](../interfaces/ColumnDefIf.md#isvisible), see [setColumnVisible](TableApi.md#setcolumnvisible)).
Columns without a column definition are always visible.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | column index, property or column definition |

#### Returns

`boolean`

- True if the column is visible, false if it is hidden or does not exist.

**`Example`**

```ts
if (!tableApi.isColumnVisible("category")) {
  tableApi.setColumnVisible("category", true);
}
```

#### Defined in

[src/lib/table/table-api.ts:393](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L393)

___

### isFooterVisible

▸ **isFooterVisible**(): `boolean`

Determines if the footer is visible: it has at least one row and is not hidden with [setFooterVisible](TableApi.md#setfootervisible).

#### Returns

`boolean`

True if the footer is visible, false otherwise.

**`Example`**

```ts
const footerShown = tableApi.isFooterVisible();
```

#### Defined in

[src/lib/table/table-api.ts:444](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L444)

___

### isHeaderVisible

▸ **isHeaderVisible**(): `boolean`

Checks if the header is visible: it has at least one row and is not hidden with [setHeaderVisible](TableApi.md#setheadervisible).

#### Returns

`boolean`

- Returns true if the header is visible, otherwise returns false.

**`Example`**

```ts
const headerShown = tableApi.isHeaderVisible();
```

#### Defined in

[src/lib/table/table-api.ts:414](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L414)

___

### isLoggingActive

▸ **isLoggingActive**(): `boolean`

Checks whether logging is currently active for the table component.

This method returns the current state of logging for the table. When logging is active,
the table outputs detailed information about its operations to the console, including:

- Rendering processes and lifecycle events
- Data modifications and updates
- Event handling and user interactions
- Performance metrics and state changes

Logging can be toggled using the `setLoggingActive(boolean)` method.

#### Returns

`boolean`

True if logging is currently enabled, false otherwise.

**`Example`**

```ts
// Check if logging is enabled
if (tableApi.isLoggingActive()) {
  console.log("Table logging is currently active");
}

// Conditionally enable logging only if it's not already active
if (!tableApi.isLoggingActive()) {
  tableApi.setLoggingActive(true);

  // Perform operations that need debugging
  tableApi.updateCells([
    {
      area: "body",
      rowIndex: 2,
      columnIndex: 3,
      value: "New Value",
      cssClasses: { "highlight": true }
    }
  ]);

  // Run some additional operations...

  // Disable logging when finished
  tableApi.setLoggingActive(false);
}
```

#### Defined in

[src/lib/table/table-api.ts:2082](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L2082)

___

### reSort

▸ **reSort**(): `void`

Re-applies the current sorting configuration to the table data and repaints.

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

The current sorting is the last [sort](TableApi.md#sort) function, otherwise the columns with a sort state (the header icons,
also restored by `autoRestoreOptions`). Useful when the underlying data has changed and needs to be re-sorted
without changing the sort columns or direction. (Before 1.1.91 only the sort items stored by `autoRestoreOptions`
were used – without them `reSort()` did nothing.)

**`Example`**

```ts
orders[0].total = 999_999;
tableApi.reSort();
```

#### Defined in

[src/lib/table/table-api.ts:1528](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1528)

___

### recalcColumnWidths

▸ **recalcColumnWidths**(`clientWidth?`): `void`

Recalculates the column widths of the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clientWidth?` | `number` | The width of the client area. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-api.ts:557](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L557)

___

### recalcWrappers

▸ **recalcWrappers**(): `void`

Recalculates the dimensions of all wrapper elements in the table.

This method is typically called after changes to the table structure or content
that might affect the layout, such as resizing columns or changing row heights.
It ensures that all wrapper elements are properly sized to match their content.

#### Returns

`void`

- This method doesn't return anything.

#### Defined in

[src/lib/table/table-api.ts:1146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1146)

___

### removeRows

▸ **removeRows**\<`T`\>(`rows`, `predicate?`): `void`

Removes specified rows from the table body.

Only works with an [AreaModelObjectArray](AreaModelObjectArray.md) body – logs a console warning otherwise.
Does **not** repaint and resets filtering and sorting of the body: afterwards call
[externalFilterChanged](TableApi.md#externalfilterchanged) (if a filter function is set) and [repaintHard](TableApi.md#repainthard) (the row count changed).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements in the rows array |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | An array of data objects to remove from the table |
| `predicate` | (`a`: `T`, `b`: `T`) => `boolean` | A comparison function that determines if two rows match - Default predicate uses strict equality (===) - The function should return true if the rows are considered a match |

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

This method removes rows from the table body that match any of the provided rows based on the predicate function.
It only works with tables that use AreaModelObjectArray as their body model.

#### Defined in

[src/lib/table/table-api.ts:1290](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1290)

___

### repaint

▸ **repaint**(): `void`

Repaints the table.

This method refreshes the visual representation of the table by delegating to the
tableScope's repaint functionality. Use this method whenever the table's visual state
needs to be updated after data changes, selection changes, or any modifications that
affect the rendered output.

Repainting the table ensures that all visible cells, rows, and styling reflect the
current state of the underlying data model and configuration settings.

Since 1.1.94 it also drops cached totals ([AreaModelIf.invalidateDerivedValues](../interfaces/AreaModelIf.md#invalidatederivedvalues), e.g. of a footer from
`footerAggregates`), so they are computed again from the changed rows. Scrolling never does that.

#### Returns

`void`

**`Example`**

```ts
// Update data and repaint the table
const tableApi = new TableApi(tableScope);
tableApi.setRows(newData);
tableApi.repaint();
```

**`Example`**

```ts
// Update selection and repaint to show the visual change
tableApi.getSelectionModel()?.togglePoint(2, 3);
tableApi.repaint();
```

**`Example`**

```ts
// After changing values in the row objects yourself, repaint to show them
orders[0].status = "paid";
tableApi.repaint();
```

#### Defined in

[src/lib/table/table-api.ts:481](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L481)

___

### repaintHard

▸ **repaintHard**(): `void`

Performs a complete repaint of the table by triggering a hard repaint on the underlying table scope.

A hard repaint is more thorough than a regular repaint and performs the following operations:
- Recalculates the height and padding of the table model
- Resets the size of the wrapper div elements
- Adjusts containers and rows positioning
- Makes additional adjustments after scrolling

Use this method when regular repaint isn't sufficient, such as when:
- Table dimensions have significantly changed
- The structure of data has been modified (rows/columns added or removed)
- The table layout needs complete recalculation
- After major DOM changes affecting the table's container

#### Returns

`void`

This method doesn't return a value

**`Example`**

```ts
// Example 1: Basic usage
tableApi.repaintHard();
```

**`Example`**

```ts
// Example 2: Using after major data changes
tableApi.setRows(newDataSet);
tableApi.repaintHard();
```

**`Example`**

```ts
// Example 3: Using after resizing a container
window.addEventListener('resize', () => {
  tableApi.repaintHard();
});
```

**`Example`**

```ts
// Example 4: Using after changing ColumnDefIf.isVisible yourself
// (setColumnVisible() does this on its own)
column.isVisible = FalseFn;
tableApi.repaintHard();
```

#### Defined in

[src/lib/table/table-api.ts:544](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L544)

___

### resetState

▸ **resetState**(): `void`

Back to the state of the code: column layout, sort icons and header groups as they were right after the table was
built (before a stored state was applied) – tree, checked and selected rows too when they are remembered
([TableOptionsIf.autoRestoreOptions](../interfaces/TableOptionsIf.md#autorestoreoptions)) or given as [TableOptionsIf.initialState](../interfaces/TableOptionsIf.md#initialstate) –, scrolled to the top,
custom data removed. Deletes the stored state. The rows keep their current order (a table has no "unsorted" order
to go back to); only the sort icons of the code come back.

#### Returns

`void`

**`Example`**

```ts
document.querySelector("#reset-layout")!.addEventListener("click", () => tableApi.resetState());
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:867](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L867)

___

### scrollToIndex

▸ **scrollToIndex**(`indexX?`, `indexY?`): `void`

Scrolls the table to display the specified row and column indices at the top-left corner of the viewport.

The row becomes the first row of the body, the column the first column of the scrollable (center) part –
as far as the scroll range allows: the last columns and rows cannot move further than to the right/bottom edge.

Fixed columns (`fixedLeftColumnCount` / `fixedRightColumnCount`) are always visible: a fixed west column scrolls
back to the start (x = 0), a fixed east column – and `-1` or any other index outside the columns – keeps the
current horizontal position.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `indexX` | `number` | `0` | The column index (model index, fixed columns included) to scroll to. Defaults to 0 (first column). `-1` keeps the horizontal position. |
| `indexY` | `number` | `0` | The vertical index (row) to scroll to. Defaults to 0 (topmost row). |

#### Returns

`void`

**`Example`**

```ts
// Scroll to the 5th row, keeping the current horizontal scroll position
tableApi.scrollToIndex(-1, 5);
```

**`Example`**

```ts
// Scroll to column 3, row 10
tableApi.scrollToIndex(3, 10);
```

**`Example`**

```ts
// Scroll to column 3, keeping the rows that are currently shown
tableApi.scrollToIndex(3, tableApi.getFirstVisibleRowIndex());
```

**`See`**

 - [scrollToPixel](TableApi.md#scrolltopixel) - For scrolling to specific pixel coordinates
 - [ensureRowIsVisible](TableApi.md#ensurerowisvisible) - For scrolling to make a specific row visible

#### Defined in

[src/lib/table/table-api.ts:319](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L319)

___

### scrollToPixel

▸ **scrollToPixel**(`px?`, `py?`): `void`

Scrolls the table content to the specified pixel coordinates.

This method allows programmatic scrolling of the table viewport to exact pixel positions.
It delegates the scrolling operation to the underlying TableScope instance.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `px` | `number` | `0` | The horizontal pixel coordinate to scroll to. Defaults to 0 (leftmost position). |
| `py` | `number` | `0` | The vertical pixel coordinate to scroll to. Defaults to 0 (topmost position). |

#### Returns

`void`

**`Example`**

```ts
// Scroll to the top-left corner of the table
tableApi.scrollToPixel(0, 0);
```

**`Example`**

```ts
// Scroll 200 pixels horizontally and 150 pixels vertically
tableApi.scrollToPixel(200, 150);
```

**`Example`**

```ts
// Scroll only vertically, keeping the current horizontal position
// (an omitted or undefined px means 0; for rows use scrollToIndex(-1, rowIndex))
tableApi.scrollToPixel(tableApi.getTableScope().scrollViewport.scrollLeft, 300);
```

**`Example`**

```ts
// Example in a component that needs precise scrolling control
class TableScroller {
  private tableApi: TableApi;

  constructor(tableApi: TableApi) {
    this.tableApi = tableApi;
  }

  scrollToPosition(x: number, y: number) {
    // Scroll to exact pixel coordinates
    this.tableApi.scrollToPixel(x, y);
  }

  scrollHalfway() {
    const tableModel = this.tableApi.getTableModel();
    const totalWidth = tableModel.getContentWidthInPixel();
    const totalHeight = tableModel.getContentHeightInPixel();

    // Scroll to the middle of the table content
    this.tableApi.scrollToPixel(totalWidth / 2, totalHeight / 2);
  }
}
```

**`See`**

 - [scrollToIndex](TableApi.md#scrolltoindex) - For scrolling based on row and column indices
 - [ensureRowIsVisible](TableApi.md#ensurerowisvisible) - For scrolling to make a specific row visible

#### Defined in

[src/lib/table/table-api.ts:283](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L283)

___

### setColumnFormula

▸ **setColumnFormula**(`property`, `formula`, `options?`): `undefined` \| [`FormulaError`](FormulaError.md)

Sets (or replaces) the formula of a column – e.g. from an input field of your app. The formula is compiled
once; an invalid formula is set anyway (the cells show `#ERROR!` / `#NAME?`) and its error is returned, so you can
show the message next to the input. No code is ever executed (no `eval`). The table repaints; totals, sorting
and filter see the new values after `repaint`, `reSort()` resp. `externalFilterChanged()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the property of the column (it becomes a calculated column) |
| `formula` | `string` | the formula, e.g. `"[price] * [quantity] * 1.19"` |
| `options?` | [`FormulaOptionsIf`](../interfaces/FormulaOptionsIf.md) | own functions |

#### Returns

`undefined` \| [`FormulaError`](FormulaError.md)

the error of the formula itself, `undefined` if it is valid
  (`#NAME?` also if there is no such column)

**`Example`**

```ts
input.addEventListener("change", () => {
  const error = tableApi.setColumnFormula("custom", input.value);
  hint.textContent = error ? `${error.code} ${error.message}` : "";
});
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/table-api.ts:1735](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1735)

___

### setColumnVisible

▸ **setColumnVisible**(`column`, `visible?`): `boolean`

Shows or hides a column and repaints the table.

The column keeps its definition, its position (also when other columns are dragged) and its width:
a hidden column is just not rendered (width 0), not copied ([copyToClipboard](TableApi.md#copytoclipboard)) and not exported
([downloadExcel](TableApi.md#downloadexcel)). Showing it again restores the previous width. Works for fixed columns, too.

The same as [ColumnDefIf.isVisible](../interfaces/ColumnDefIf.md#isvisible) – this method sets it to [TrueFn](../modules.md#truefn) / [FalseFn](../modules.md#falsefn) (an own
`isVisible` function of the column is replaced). Columns without a column definition (e.g. `bodyData` +
`columnSizes` without `columnDefs`) can't be hidden.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | `undefined` | column index (fixed columns included), property (e.g. `"category"`) or the column definition |
| `visible?` | `boolean` | `true` | false hides the column |

#### Returns

`boolean`

false if the column (definition) does not exist

**`Example`**

```ts
// hide a column by property, show it again later
tableApi.setColumnVisible("category", false);
tableApi.setColumnVisible("category", true);
```

**`Example`**

```ts
// a checkbox list "visible columns"
tableApi.getTableModel().getColumnDefs()?.forEach((columnDef, index) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = tableApi.isColumnVisible(index);
  checkbox.addEventListener("change", () => tableApi.setColumnVisible(columnDef, checkbox.checked));
  document.body.append(checkbox, columnDef.headerLabel);
});
```

#### Defined in

[src/lib/table/table-api.ts:377](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L377)

___

### setColumnWidth

▸ **setColumnWidth**(`columnIndex`, `width`): `void`

Sets the width of a specific column in the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column to resize. |
| `width` | `number` | The new width to set for the column, in pixels. |

#### Returns

`void`

- This method doesn't return anything.

#### Defined in

[src/lib/table/table-api.ts:1158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1158)

___

### setCustomState

▸ **setCustomState**(`custom`): `void`

Stores data of your application with the table state (part `custom`), e.g. the text of a filter field. It is
reported with [EventListenerIf.onStateChanged](../interfaces/EventListenerIf.md#onstatechanged), stored with `autoRestoreCustomState` and returned by
[getState](TableApi.md#getstate) – also after a reload, so you can restore your filter in `tableReady`. Must be JSON.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `custom` | `unknown` | your data (JSON) |

#### Returns

`void`

**`Example`**

```ts
filterInput.addEventListener("input", () => {
  tableApi.setCustomState({ filter: filterInput.value });
  tableApi.externalFilterChanged();
});
// after a reload (tableReady):
const custom = tableApi.getState(["custom"]).custom as { filter?: string } | undefined;
filterInput.value = custom?.filter ?? "";
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:889](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L889)

___

### setFooterVisible

▸ **setFooterVisible**(`visible?`): `void`

Shows or hides the footer and repaints the table.

A hidden footer takes no space – the body gets taller. Its rows stay in the model, so `setFooterVisible(true)`
brings them back (an own footer model, e.g. totals, is asked for its values again).
Requires a [TableModel](TableModel.md) (what all factories create).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `visible?` | `boolean` | `true` | false hides the footer |

#### Returns

`void`

**`Example`**

```ts
// show the totals footer only while a filter is active
tableApi.setFooterVisible(!!tableOptions.externalFilterFunction);
```

#### Defined in

[src/lib/table/table-api.ts:432](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L432)

___

### setHeaderGroupCollapsed

▸ **setHeaderGroupCollapsed**(`id`, `collapsed?`): `boolean`

Collapses or expands a header group ([CellGroupIf](../interfaces/CellGroupIf.md) with `toggle: true`) – like a click on its toggle.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `id` | `string` | `undefined` | [CellGroupIf.id](../interfaces/CellGroupIf.md#id), otherwise the path of the labels, e.g. `"Customer"` or `"2026/Q1"` |
| `collapsed` | `boolean` | `true` | true = collapse |

#### Returns

`boolean`

false if the header has no such group

**`Example`**

```ts
tableApi.setHeaderGroupCollapsed("Customer", true);
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:905](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L905)

___

### setHeaderVisible

▸ **setHeaderVisible**(`visible?`): `void`

Shows or hides the header and repaints the table.

A hidden header takes no space – the body moves up and shows more rows. The header rows stay in the model
(labels, sort icons, header groups), so `setHeaderVisible(true)` brings them back unchanged.
Requires a [TableModel](TableModel.md) (what all factories create).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `visible?` | `boolean` | `true` | false hides the header |

#### Returns

`void`

**`Example`**

```ts
// a compact view without column headers
tableApi.setHeaderVisible(false);
```

**`Example`**

```ts
// toggle from a button
document.querySelector("#toggle-header")!.addEventListener("click", () =>
  tableApi.setHeaderVisible(!tableApi.isHeaderVisible()));
```

#### Defined in

[src/lib/table/table-api.ts:342](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L342)

___

### setLoggingActive

▸ **setLoggingActive**(`active`): `void`

Checks whether logging is currently active for the table component.

This method returns the current state of logging for the table. When logging is active,
the table outputs detailed information about its operations to the console, including:

- Rendering processes and lifecycle events
- Data modifications and updates
- Event handling and user interactions
- Performance metrics and state changes

Logging can be toggled using the `setLoggingActive(boolean)` method.

#### Parameters

| Name | Type |
| :------ | :------ |
| `active` | `boolean` |

#### Returns

`void`

True if logging is currently enabled, false otherwise.

**`Example`**

```ts
// Check if logging is enabled
if (tableApi.isLoggingActive()) {
  console.log("Table logging is currently active");
}

// Conditionally enable logging only if it's not already active
if (!tableApi.isLoggingActive()) {
  tableApi.setLoggingActive(true);

  // Perform operations that need debugging
  tableApi.updateCells([
    {
      area: "body",
      rowIndex: 2,
      columnIndex: 3,
      value: "New Value",
      cssClasses: { "highlight": true }
    }
  ]);

  // Run some additional operations...

  // Disable logging when finished
  tableApi.setLoggingActive(false);
}
```

#### Defined in

[src/lib/table/table-api.ts:2036](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L2036)

___

### setPivotConfig

▸ **setPivotConfig**(`changes`, `rows?`): `boolean`

Pivot table ([PivotFactory](PivotFactory.md)): pivots again – other row fields, column fields or values, or new rows –
without a new table model (a new model would rebuild the table in every framework wrapper). The model gets new
columns, header and totals; rows whose path stays keep their expanded state, the filter stays, column widths of
columns that stay are kept, so are columns hidden with `setColumnVisible`. Sorting, selection and focus are reset
(the columns are different). An invalid configuration throws and changes nothing.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | `Partial`\<[`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`any`\>\> | the changed parts, e.g. `{ columnFields: ["jahr"] }`; `{}` = pivot the current rows again (e.g. after new keys) |
| `rows?` | `any`[] | new source rows (default: the current ones) |

#### Returns

`boolean`

false if the table model is no pivot table

**`Example`**

```ts
// a select with the column field
select.addEventListener("change", () => tableApi.setPivotConfig({ columnFields: [select.value] }));
```

**`Example`**

```ts
tableApi.setPivotConfig({ values: [{ value: "umsatz", aggregator: "avg" }] });   // averages instead of sums
tableApi.setPivotConfig({}, await loadSales());                                 // new data
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/table-api.ts:1628](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1628)

___

### setRowExpanded

▸ **setRowExpanded**(`rowIndex`, `expanded`): `boolean`

Tree tables: expands or collapses the displayed body row `rowIndex` (like a click on its arrow), repaints and
remembers the state with `autoRestoreOptions`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | index of the displayed body row |
| `expanded` | `boolean` | the new state |

#### Returns

`boolean`

false if the table is no tree, the row does not exist or already has this state

**`Example`**

```ts
tableApi.setRowExpanded(0, true);   // expand the first row
```

#### Defined in

[src/lib/table/table-api.ts:1564](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1564)

___

### setRowGroupBy

▸ **setRowGroupBy**(`groupBy`): `boolean`

Row grouping ([RowGroupFactory](RowGroupFactory.md)): groups the rows by other levels – without a new table model (a new model
would rebuild the table in every framework wrapper). Groups whose path stays keep their expanded state; filter,
sorting and checked rows stay; the columns of the grouped properties are hidden (the previously grouped ones come
back) and the header of the group column follows. An empty list shows the rows without groups.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `groupBy` | [`RowGroupField`](../modules.md#rowgroupfield)[] | the new levels, top first: property paths, functions or [RowGroupFieldIf](../interfaces/RowGroupFieldIf.md) |

#### Returns

`boolean`

false if the body is no row grouping

**`Example`**

```ts
// a select with "region", "produkt", "region,produkt"
select.addEventListener("change", () => tableApi.setRowGroupBy(select.value.split(",")));
```

**`Example`**

```ts
tableApi.setRowGroupBy([]);   // flat again (with the total row)
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/table-api.ts:1587](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1587)

___

### setRows

▸ **setRows**\<`T`\>(`rows`): `void`

Sets the rows data for the table body, replacing any existing rows.

Only works with an [AreaModelObjectArray](AreaModelObjectArray.md) body – logs a console warning otherwise.
Does **not** repaint and resets filtering and sorting of the body: afterwards call
[externalFilterChanged](TableApi.md#externalfilterchanged) (if a filter function is set) and [repaintHard](TableApi.md#repainthard) (the row count changed).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements in the rows array |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | An array of data objects to set as the table's rows |

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

This method replaces all existing rows in the table body with the provided array of data objects.
It only works with tables that use AreaModelObjectArray as their body model.

#### Defined in

[src/lib/table/table-api.ts:1198](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1198)

___

### setSelectionModel

▸ **setSelectionModel**(`sm`, `repaint?`): `void`

Sets the selection model for the table.

This method allows you to replace the current selection model with a new one,
which controls how cells, rows, or columns can be selected in the table.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `sm` | [`SelectionModel`](SelectionModel.md) | `undefined` | The new selection model to be set. This model defines the selection behavior including selection type (none, cell, row, column), selection mode (single, multi), and manages the selected ranges. |
| `repaint?` | `boolean` | `true` | Whether to repaint the table after changing the selection model. Default is true, which immediately reflects the change visually. Set to false if you want to avoid immediate repainting. |

#### Returns

`void`

**`Example`**

```ts
// Create a new selection model with row selection and multi-select mode
const selectionModel = new SelectionModel("row", "multi");

// Set the new selection model and repaint the table
tableApi.setSelectionModel(selectionModel);

// Set a selection model without repainting (if you plan to make more changes)
tableApi.setSelectionModel(selectionModel, false);
// ... make other changes ...
tableApi.repaint(); // Now repaint once
```

#### Defined in

[src/lib/table/table-api.ts:612](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L612)

___

### setShowValuesAs

▸ **setShowValuesAs**(`property`, `showValuesAs`): `boolean`

„Show values as“: shows the numbers of a column differently – share of the column total, running total, rank …
(see [ShowValuesAs](../modules.md#showvaluesas)) – or normal again (`undefined`). No new model: the table repaints.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the property of the column |
| `showValuesAs` | `undefined` \| [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig) | the mode (with options) or `undefined` for the values |

#### Returns

`boolean`

false if there is no such column or the mode is unknown

**`Example`**

```ts
select.addEventListener("change", () =>
  tableApi.setShowValuesAs("total", select.value ? select.value as ShowValuesAs : undefined));
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/table-api.ts:1690](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1690)

___

### showLoadingOverlay

▸ **showLoadingOverlay**(`text?`): `void`

Shows "Loading…" with a CSS spinner over the body – e.g. while a server answers. The header and footer stay
readable; rows already shown stay visible under a semi-transparent layer. By default mouse and editing on the
body are blocked until [hideOverlay](TableApi.md#hideoverlay) ([OverlayOptionsIf.blockInteractionWhileLoading](../interfaces/OverlayOptionsIf.md#blockinteractionwhileloading)).
Screen readers: the host gets `aria-busy="true"`, the text is announced.

Texts, delay and own content: [TableOptionsIf.overlayOptions](../interfaces/TableOptionsIf.md#overlayoptions). Framework wrappers have a `loading` prop
that calls this method (no re-creation of the table).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text?` | `string` | text for this overlay only, e.g. `"Saving…"`; default [OverlayOptionsIf.loadingText](../interfaces/OverlayOptionsIf.md#loadingtext) |

#### Returns

`void`

**`Example`**

```ts
tableApi.showLoadingOverlay();
fetch("/api/orders")
  .then(response => response.json())
  .then((orders: object[]) => {
    tableApi.setRows(orders);
    tableApi.repaintHard();
  })
  .finally(() => tableApi.hideOverlay()); // 0 rows? "No rows to show" appears by itself
```

**`Since`**

1.1.92

**`See`**

Training: [Live data](https://gui.expert/training/live-data/)

#### Defined in

[src/lib/table/table-api.ts:754](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L754)

___

### showNoRowsOverlay

▸ **showNoRowsOverlay**(`text?`): `void`

Shows the "no rows" overlay, also over rows – e.g. when the server says "no permission". An empty body shows
"No rows to show" anyway ([OverlayOptionsIf.autoNoRows](../interfaces/OverlayOptionsIf.md#autonorows)); this method is for other cases.
Ends with [hideOverlay](TableApi.md#hideoverlay).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text?` | `string` | text for this overlay only; default [OverlayOptionsIf.noRowsText](../interfaces/OverlayOptionsIf.md#norowstext) |

#### Returns

`void`

**`Example`**

```ts
tableApi.showNoRowsOverlay("You may not see these orders");
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-api.ts:769](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L769)

___

### sort

▸ **sort**(`compareFn`): `void`

Sorts the table data using a custom comparison function.

This method allows sorting of table rows by providing a custom comparison function. The comparison function
should follow the standard JavaScript array sort comparator pattern, returning:
- A negative number if the first element should be sorted before the second
- A positive number if the first element should be sorted after the second
- Zero if the elements are equal

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn` | (`a`: `any`, `b`: `any`) => `number` | A function that defines the sort order. The function should accept two arguments and return a number indicating their relative order: - Negative number: first argument should come before second - Positive number: second argument should come before first - Zero: elements are equal |

#### Returns

`void`

**`Example`**

```ts
// Sort table rows by a specific property in ascending order
tableApi.sort((a: Person, b: Person) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});
```

**`Example`**

```ts
// Sort numbers in descending order
tableApi.sort((a: { value: number }, b: { value: number }) => b.value - a.value);
```

**`Example`**

```ts
// Sort with multiple criteria
tableApi.sort((a: Order, b: Order) => {
  // First sort by status
  const statusCompare = a.status.localeCompare(b.status);
  if (statusCompare !== 0) return statusCompare;
  
  // Then sort by name if status is equal
  return a.customer.localeCompare(b.customer);
});
```

**`Example`**

```ts
// Case-insensitive string sorting
tableApi.sort((a: Person, b: Person) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase())
);
```

**`Example`**

```ts
// Tree tables: the function compares the tree rows of siblings (your objects: a.data / b.data),
// children stay below their parent
tableApi.sort((a: TreeRowIf<OrderNode>, b: TreeRowIf<OrderNode>) => b.data.total - a.data.total);
```

#### Defined in

[src/lib/table/table-api.ts:1799](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1799)

___

### sortByColumn

▸ **sortByColumn**(`column`, `sortState?`): `boolean`

Sorts by one column from code – e.g. from your own button – exactly like a double click on the
column header: rows, header icon, filter (sort order survives filtering) and auto-restore.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` | column index or property, e.g. `"total"` |
| `sortState?` | [`SortState`](../modules.md#sortstate) | `"asc"` or `"desc"`; omitted: toggles like the header (asc → desc → …) |

#### Returns

`boolean`

false if the column does not exist

**`Example`**

```ts
document.querySelector("#by-total")!.addEventListener("click", () => tableApi.sortByColumn("total", "desc"));
```

#### Defined in

[src/lib/table/table-api.ts:1509](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1509)

___

### triggerAction

▸ **triggerAction**(`actionId`): `void`

Triggers the action with the given action ID.
This function can be invoked programmatically.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` | The ID of the action to trigger. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-api.ts:624](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L624)

___

### updateCells

▸ **updateCells**(`events`, `repaintAll?`): `void`

Updates the cells in the table with the provided cell update events.

This method allows you to update specific cells in the table without requiring a full table repaint,
which can significantly improve performance when updating large tables frequently.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `events` | [`TableCellUpdateEventIf`](../interfaces/TableCellUpdateEventIf.md)[] | `undefined` | An array of cell update events, each defining a single cell update operation. Each event must specify: - area: The table area to update ('header', 'body', or 'footer') - rowIndex: The row index of the cell to update - columnIndex: The column index of the cell to update - value: The new value to set for the cell - cssClasses: Optional object mapping CSS class names to boolean values (true to add the class, false to remove it) |
| `repaintAll?` | `boolean` | `false` | Whether to repaint the entire table after updating cells. - If true: All cells will be repainted after updating (slower but ensures visual consistency) - If false: Only the modified cells will be repainted (faster, recommended for frequent updates) |

#### Returns

`void`

**`Example`**

```ts
// Update a single cell with a new value and CSS classes
tableApi.updateCells([{
  area: 'body',
  rowIndex: 3,
  columnIndex: 2,
  value: 42,
  cssClasses: {
    'highlight': true,   // Add 'highlight' class
    'error': false       // Remove 'error' class if present
  }
}]);
```

**`Example`**

```ts
// Update multiple cells at once
tableApi.updateCells([
  {
    area: 'body',
    rowIndex: 1,
    columnIndex: 1,
    value: 'New Value 1',
    cssClasses: { 'updated': true }
  },
  {
    area: 'body',
    rowIndex: 2,
    columnIndex: 3,
    value: 'New Value 2',
    cssClasses: { 'updated': true }
  }
]);
```

**`Example`**

```ts
// Update cells and repaint the entire table
tableApi.updateCells([
  { area: 'body', rowIndex: 0, columnIndex: 0, value: 'Hello', cssClasses: { 'bg-green-0': true } },
  { area: 'body', rowIndex: 1, columnIndex: 1, value: 'World', cssClasses: { 'bg-red-0': true } }
], true);
```

**`Example`**

```ts
// High-performance animation example (update without full repaint)
function animateCell() {
  const value = Math.sin(Date.now() / 1000) * 50;
  const cssClasses = {
    'positive': value > 0,
    'negative': value < 0
  };

  tableApi.updateCells([{
    area: 'body',
    rowIndex: 0,
    columnIndex: 0,
    value: Math.round(value),
    cssClasses
  }]);

  requestAnimationFrame(animateCell);
}
animateCell();
```

#### Defined in

[src/lib/table/table-api.ts:181](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L181)

___

### updateRows

▸ **updateRows**\<`T`\>(`rows`, `predicate?`): `void`

Updates existing rows in the table body with new data.

Only works with an [AreaModelObjectArray](AreaModelObjectArray.md) body – logs a console warning otherwise.
The properties are copied into the existing objects; nothing is repainted – call [repaint](TableApi.md#repaint) afterwards.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements in the rows array |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | An array of data objects containing the updated values |
| `predicate` | (`a`: `T`, `b`: `T`) => `boolean` | A comparison function that determines which rows to update - Default predicate uses strict equality (===) - The function should return true if the row should be updated |

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

This method updates existing rows in the table body with new values from the provided rows array.
For each row in the table, if the predicate returns true when compared with any row in the provided array,
all properties from the provided row will be copied to the existing row.
It only works with tables that use AreaModelObjectArray as their body model.

#### Defined in

[src/lib/table/table-api.ts:1478](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1478)
