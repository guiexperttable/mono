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
| scroll | [scrollToIndex](TableApi.md#scrolltoindex), [ensureRowIsVisible](TableApi.md#ensurerowisvisible), [scrollToPixel](TableApi.md#scrolltopixel), [getFirstVisibleRowIndex](TableApi.md#getfirstvisiblerowindex) |
| sort | [sortByColumn](TableApi.md#sortbycolumn), [sort](TableApi.md#sort), [reSort](TableApi.md#resort) |
| filter | [externalFilterChanged](TableApi.md#externalfilterchanged) (with [TableOptionsIf.externalFilterFunction](../interfaces/TableOptionsIf.md#externalfilterfunction)) |
| export | [copyToClipboard](TableApi.md#copytoclipboard), [downloadExcel](TableApi.md#downloadexcel) |
| change data | [updateCells](TableApi.md#updatecells), [setRows](TableApi.md#setrows), [addRows](TableApi.md#addrows), [updateRows](TableApi.md#updaterows), [removeRows](TableApi.md#removerows) |
| redraw | [repaint](TableApi.md#repaint) (same row count), [repaintHard](TableApi.md#repainthard) (row count or heights changed) |
| columns | [autoResizeColumns](TableApi.md#autoresizecolumns), [setColumnWidth](TableApi.md#setcolumnwidth), [recalcColumnWidths](TableApi.md#recalccolumnwidths) |
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
- [autoResizeColumns](TableApi.md#autoresizecolumns)
- [clearSelection](TableApi.md#clearselection)
- [copyToClipboard](TableApi.md#copytoclipboard)
- [destroy](TableApi.md#destroy)
- [downloadExcel](TableApi.md#downloadexcel)
- [ensureRowIsVisible](TableApi.md#ensurerowisvisible)
- [externalFilterChanged](TableApi.md#externalfilterchanged)
- [findRowFromAllRowsByAllCriteria](TableApi.md#findrowfromallrowsbyallcriteria)
- [findRowFromFilteredRowsByAllCriteria](TableApi.md#findrowfromfilteredrowsbyallcriteria)
- [findRows](TableApi.md#findrows)
- [getBodyModel](TableApi.md#getbodymodel)
- [getDisplayedRowCount](TableApi.md#getdisplayedrowcount)
- [getFirstFullVisibleRowIndex](TableApi.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](TableApi.md#getfirstvisiblerowindex)
- [getLastFullVisibleRowIndex](TableApi.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](TableApi.md#getlastvisiblerowindex)
- [getSelectionModel](TableApi.md#getselectionmodel)
- [getShortcutActionMapping](TableApi.md#getshortcutactionmapping)
- [getTableModel](TableApi.md#gettablemodel)
- [getTableScope](TableApi.md#gettablescope)
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
- [scrollToIndex](TableApi.md#scrolltoindex)
- [scrollToPixel](TableApi.md#scrolltopixel)
- [setColumnVisible](TableApi.md#setcolumnvisible)
- [setColumnWidth](TableApi.md#setcolumnwidth)
- [setFooterVisible](TableApi.md#setfootervisible)
- [setHeaderVisible](TableApi.md#setheadervisible)
- [setLoggingActive](TableApi.md#setloggingactive)
- [setRows](TableApi.md#setrows)
- [setSelectionModel](TableApi.md#setselectionmodel)
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

[src/lib/table/table-api.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L77)

## Properties

### tableScope

• `Readonly` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/table-api.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L78)

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

[src/lib/table/table-api.ts:843](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L843)

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

[src/lib/table/table-api.ts:872](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L872)

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

[src/lib/table/table-api.ts:745](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L745)

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

[src/lib/table/table-api.ts:486](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L486)

___

### copyToClipboard

▸ **copyToClipboard**(): `Promise`\<`string`\>

Copies the selected data from the table to the clipboard.

This method leverages the copyService to extract and copy the currently selected data
from the table. It works with the current selection state and focus position to determine
what content should be copied.

The copied data is formatted as tab-separated text that can be pasted into spreadsheet
applications like Excel or text editors while maintaining the tabular structure.

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

[src/lib/table/table-api.ts:606](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L606)

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

[src/lib/table/table-api.ts:407](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L407)

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

[src/lib/table/table-api.ts:643](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L643)

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

[src/lib/table/table-api.ts:1210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1210)

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

[src/lib/table/table-api.ts:213](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L213)

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

[src/lib/table/table-api.ts:1057](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1057)

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

[src/lib/table/table-api.ts:1004](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1004)

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

[src/lib/table/table-api.ts:946](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L946)

___

### getBodyModel

▸ **getBodyModel**(): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Retrieves the area model for the body section of the table.

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

The area model interface that provides access to the table's body data,
                      including rows, cells, and their values.

#### Defined in

[src/lib/table/table-api.ts:790](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L790)

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

[src/lib/table/table-api.ts:1223](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1223)

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

[src/lib/table/table-api.ts:1286](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1286)

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

[src/lib/table/table-api.ts:1258](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1258)

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

[src/lib/table/table-api.ts:1350](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1350)

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

[src/lib/table/table-api.ts:1318](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1318)

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

[src/lib/table/table-api.ts:731](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L731)

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

[src/lib/table/table-api.ts:567](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L567)

___

### getTableModel

▸ **getTableModel**(): [`TableModelIf`](../interfaces/TableModelIf.md)

Retrieves the table model that contains all data and structure information for the table.

#### Returns

[`TableModelIf`](../interfaces/TableModelIf.md)

The table model interface that provides access to the table's data structure,
                       including header, body, and footer area models.

#### Defined in

[src/lib/table/table-api.ts:780](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L780)

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

[src/lib/table/table-api.ts:688](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L688)

___

### isColumnVisible

▸ **isColumnVisible**(`_column`): `boolean`

Returns whether a column is visible or not.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_column` | `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | The column index or the column definition. |

#### Returns

`boolean`

- True if the column is visible, false otherwise.

#### Defined in

[src/lib/table/table-api.ts:326](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L326)

___

### isFooterVisible

▸ **isFooterVisible**(): `boolean`

Determines if the footer is visible.

#### Returns

`boolean`

True if the footer is visible, false otherwise.

#### Defined in

[src/lib/table/table-api.ts:356](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L356)

___

### isHeaderVisible

▸ **isHeaderVisible**(): `boolean`

Checks if the header is visible.

#### Returns

`boolean`

- Returns true if the header is visible, otherwise returns false.

#### Defined in

[src/lib/table/table-api.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L336)

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

[src/lib/table/table-api.ts:1443](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1443)

___

### reSort

▸ **reSort**(): `void`

Re-applies the current sorting configuration to the table data.

#### Returns

`void`

- This method doesn't return anything.

**`Description`**

This method triggers a re-sort of the table data using the current sorting configuration.
It's useful when the underlying data has changed and needs to be re-sorted without changing
the sort columns or direction.

#### Defined in

[src/lib/table/table-api.ts:1135](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1135)

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

[src/lib/table/table-api.ts:463](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L463)

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

[src/lib/table/table-api.ts:758](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L758)

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

[src/lib/table/table-api.ts:902](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L902)

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
// After changing column visibility, repaint to reflect changes
tableApi.setColumnVisible(0, false);
tableApi.repaint();
```

#### Defined in

[src/lib/table/table-api.ts:390](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L390)

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
// Example 4: Using after changing column visibility
tableApi.setColumnVisible(2, false);
tableApi.repaintHard();
```

#### Defined in

[src/lib/table/table-api.ts:451](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L451)

___

### scrollToIndex

▸ **scrollToIndex**(`indexX?`, `indexY?`): `void`

Scrolls the table to display the specified row and column indices at the top-left corner of the viewport.

This method allows programmatic scrolling to a specific position in the table grid based on row and column indices.
It uses the underlying TableScope's scrolling mechanism to navigate to the target location.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `indexX` | `number` | `0` | The horizontal index (column) to scroll to. Defaults to 0 (leftmost column). |
| `indexY` | `number` | `0` | The vertical index (row) to scroll to. Defaults to 0 (topmost row). |

#### Returns

`void`

**`Example`**

```ts
// Scroll to the 5th row, keeping the current horizontal scroll position
tableApi.scrollToIndex(0, 5);
```

**`Example`**

```ts
// Scroll to column 3, row 10
tableApi.scrollToIndex(3, 10);
```

**`See`**

 - [scrollToPixel](TableApi.md#scrolltopixel) - For scrolling to specific pixel coordinates
 - [ensureRowIsVisible](TableApi.md#ensurerowisvisible) - For scrolling to make a specific row visible

#### Defined in

[src/lib/table/table-api.ts:293](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L293)

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
tableApi.scrollToPixel(undefined, 300);
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

[src/lib/table/table-api.ts:266](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L266)

___

### setColumnVisible

▸ **setColumnVisible**(`_column`, `_visible?`): `void`

Sets the visibility of a column in the table.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `_column` | `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | `undefined` |
| `_visible` | `boolean` | `true` |

#### Returns

`void`

- There is no return value.

#### Defined in

[src/lib/table/table-api.ts:316](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L316)

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

[src/lib/table/table-api.ts:770](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L770)

___

### setFooterVisible

▸ **setFooterVisible**(`_visible?`): `void`

Sets the visibility of the footer.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `_visible` | `boolean` | `true` | Indicates whether the footer should be visible or not. Default value is true. |

#### Returns

`void`

- This method does not return any value.

#### Defined in

[src/lib/table/table-api.ts:347](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L347)

___

### setHeaderVisible

▸ **setHeaderVisible**(`_visible?`): `void`

Sets whether the header is visible or not.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `_visible` | `boolean` | `true` | A boolean value indicating whether the header should be visible. Default value is true. |

#### Returns

`void`

undefined

#### Defined in

[src/lib/table/table-api.ts:304](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L304)

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

[src/lib/table/table-api.ts:1397](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1397)

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

[src/lib/table/table-api.ts:810](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L810)

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

[src/lib/table/table-api.ts:518](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L518)

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

#### Defined in

[src/lib/table/table-api.ts:1183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1183)

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

[src/lib/table/table-api.ts:1121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1121)

___

### triggerAction

▸ **triggerAction**(`actionId`): `void`

Triggers the action with the given action ID.
This function can be invoked programmatically.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` | The ID of the action to trigger. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-api.ts:530](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L530)

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

[src/lib/table/table-api.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L165)

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

[src/lib/table/table-api.ts:1090](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-api.ts#L1090)
