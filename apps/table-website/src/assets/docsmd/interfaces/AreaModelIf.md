[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelIf

# Interface: AreaModelIf

AreaModelIf

**`Description`**

The AreaModelIf interface represents a model for a specific area of a table (header, body, or footer).
It provides methods for accessing and manipulating data within that area.

In the GuiExpert Table library, a table is divided into three main areas:
- Header: Contains column titles and optional filter/sort controls
- Body: Contains the main data of the table
- Footer: Contains summary information or additional controls

Each of these areas can be further divided into three sections:
- West: Fixed columns on the left side
- Center: Scrollable columns in the middle
- East: Fixed columns on the right side

<pre>
 +----------------+-------------------+--------------+
 |  header/west   |  header/center    | header/east  |
 +----------------+-------------------+--------------+
 |  body/west     |  body/center      | body/east    |
 +----------------+-------------------+--------------+
 |  footer/west   |  footer/center    | footer/east  |
 +----------------+-------------------+--------------+
</pre>

The AreaModelIf interface is a core component of the table's architecture. While simple tables might use
basic data structures like arrays of arrays or arrays of objects, the GuiExpert Table library uses a more
sophisticated model approach. An AreaModelIf implementation provides information about:

- The number of rows in the area
- The content of each cell
- The styling of cells (CSS classes, custom styles)
- Cell spanning (colspan, rowspan)
- Row heights
- Cell editability and selectability
- Row selection state
- Filtering and sorting capabilities

This model-based approach provides maximum flexibility for creating complex, interactive tables.

**`Example`**

```ts
// Example of creating a simple table with header, body, and footer areas
import { TableFactory, TableModelIf } from "@guiexpert/table";

// Create data for each area
const headerData = [["ID", "Name", "Age"]];
const bodyData = [
  [1, "John", 30],
  [2, "Jane", 25],
  [3, "Bob", 40]
];
const footerData = [["", "Average", "31.67"]];

// Create the table model with all three areas
const tableModel: TableModelIf = TableFactory.createTableModel({
  headerData,
  bodyData,
  footerData
});

// Access the area models
const headerModel = tableModel.getAreaModel("header");
const bodyModel = tableModel.getAreaModel("body");
const footerModel = tableModel.getAreaModel("footer");

// Get information from the body model
console.log(`Number of rows: ${bodyModel.getRowCount()}`);
console.log(`Value at (1,1): ${bodyModel.getValueAt(1, 1)}`); // "Jane"
```

**`Example`**

```ts
// Example of creating a table with object data and column definitions
import { TableFactory, TableModelIf, ColumnDefIf } from "@guiexpert/table";

// Define the data as an array of objects
const data = [
  { id: 1, name: "John", age: 30 },
  { id: 2, name: "Jane", age: 25 },
  { id: 3, name: "Bob", age: 40 }
];

// Define column definitions
const columnDefs: ColumnDefIf[] = [
  new ColumnDef('id', 'ID', new Size(80, 'px')),
  new ColumnDef('name', 'Name', new Size(150, 'px')),
  new ColumnDef('age', 'Age', new Size(80, 'px'))
];

// Create the table model
const tableModel: TableModelIf = TableFactory.createByObjectArray(
  data,
  [["ID", "Name", "Age"]], // header
  [], // footer (empty)
  0, // fixedLeftColumnCount
  0, // fixedRightColumnCount
  false, // rowCheckboxVisible
  undefined, // defaultRowHeights
  columnDefs
);
```

**`Example`**

```ts
// Example of implementing a custom AreaModelIf
import { AreaModelIf, AreaIdent, CellRendererIf } from "@guiexpert/table";

class CustomAreaModel extends AreaModel {
  constructor(
    areaIdent: AreaIdent,
    private readonly data: any[][],
    private readonly rowHeight: number = 30
  ) {
    super();
    this.areaIdent = areaIdent;
  }

  override getRowCount(): number {
    return this.data.length;
  }

  override getValueAt(rowIndex: number, columnIndex: number): any {
    return this.data[rowIndex]?.[columnIndex];
  }

  override getRowHeight(_rowIndex: number): number {
    return this.rowHeight;
  }
  // AreaModel has defaults for all other methods
}
```

**`See`**

 - [TableModelIf](TableModelIf.md) - The parent interface that contains area models
 - [AreaModel](../classes/AreaModel.md) - A base implementation of this interface
 - [AbstractAreaModel](../classes/AbstractAreaModel.md) - An abstract implementation with common functionality
 - [AreaModelObjectArray](../classes/AreaModelObjectArray.md) - An implementation for object array data

## Implemented by

- [`AbstractAreaModel`](../classes/AbstractAreaModel.md)
- [`AreaModel`](../classes/AreaModel.md)
- [`AreaModelCellGroups`](../classes/AreaModelCellGroups.md)
- [`AreaModelHidden`](../classes/AreaModelHidden.md)
- [`CoverGridBodyModel`](../classes/CoverGridBodyModel.md)

## Table of contents

### Properties

- [areaIdent](AreaModelIf.md#areaident)
- [rowSelectionModel](AreaModelIf.md#rowselectionmodel)

### Methods

- [appendRows](AreaModelIf.md#appendrows)
- [canMoveRows](AreaModelIf.md#canmoverows)
- [changeColumnOrder](AreaModelIf.md#changecolumnorder)
- [doSort](AreaModelIf.md#dosort)
- [externalFilterChanged](AreaModelIf.md#externalfilterchanged)
- [getCellRenderer](AreaModelIf.md#getcellrenderer)
- [getColspanAt](AreaModelIf.md#getcolspanat)
- [getConstantRowHeight](AreaModelIf.md#getconstantrowheight)
- [getCustomClassesAt](AreaModelIf.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelIf.md#getcustomstyleat)
- [getInputValueAt](AreaModelIf.md#getinputvalueat)
- [getMaxColspan](AreaModelIf.md#getmaxcolspan)
- [getMaxRowspan](AreaModelIf.md#getmaxrowspan)
- [getRowByIndex](AreaModelIf.md#getrowbyindex)
- [getRowCount](AreaModelIf.md#getrowcount)
- [getRowHeight](AreaModelIf.md#getrowheight)
- [getRowValue](AreaModelIf.md#getrowvalue)
- [getRowspanAt](AreaModelIf.md#getrowspanat)
- [getTextValueAt](AreaModelIf.md#gettextvalueat)
- [getTooltipAt](AreaModelIf.md#gettooltipat)
- [getUnfilteredRowCount](AreaModelIf.md#getunfilteredrowcount)
- [getValueAt](AreaModelIf.md#getvalueat)
- [getYPosByRowIndex](AreaModelIf.md#getyposbyrowindex)
- [init](AreaModelIf.md#init)
- [invalidateDerivedValues](AreaModelIf.md#invalidatederivedvalues)
- [isCalculatedProperty](AreaModelIf.md#iscalculatedproperty)
- [isEditable](AreaModelIf.md#iseditable)
- [isFilterable](AreaModelIf.md#isfilterable)
- [isRowCheckable](AreaModelIf.md#isrowcheckable)
- [isRowChecked](AreaModelIf.md#isrowchecked)
- [isRowHeaderCell](AreaModelIf.md#isrowheadercell)
- [isSelectable](AreaModelIf.md#isselectable)
- [moveRows](AreaModelIf.md#moverows)
- [setRowChecked](AreaModelIf.md#setrowchecked)
- [setValue](AreaModelIf.md#setvalue)
- [sort](AreaModelIf.md#sort)

## Properties

### areaIdent

• **areaIdent**: [`AreaIdent`](../modules.md#areaident)

The identifier for one of the areas: header, body, footer.
This property determines which area of the table this model represents.

**`Example`**

```ts
// Creating an area model for the header
const headerModel = new AreaModel();
headerModel.areaIdent = "header";
```

**`Example`**

```ts
// Checking which area a model represents
if (areaModel.areaIdent === "body") {
  // This is a body area model
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:166](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L166)

___

### rowSelectionModel

• **rowSelectionModel**: `undefined` \| [`CheckboxModelIf`](CheckboxModelIf.md)\<`any`\>

A model and controller for row checkbox selection.
This property allows the area to support row selection via checkboxes.

**`Example`**

```ts
// Creating a checkbox model for row selection
import { CheckboxModel } from "@guiexpert/table";

const bodyModel = new AreaModel();
bodyModel.areaIdent = "body";
bodyModel.rowSelectionModel = new CheckboxModel();

// Later, check if a row is selected
const isSelected = bodyModel.isRowChecked(5);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:185](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L185)

## Methods

### appendRows

▸ **appendRows**(`rows`, `ctx`): ``false`` \| [`AppendRowsModelResultIf`](AppendRowsModelResultIf.md)

Optional (live data, since 1.1.108): appends rows **in place** – the active filter only for the new rows, sorted
in by the active order, oldest rows removed for a ring buffer – and reports the display positions, so the table
moves selection, focus and scroll position along (`tableApi.appendRows()`). Implemented by
[AreaModelObjectArray](../classes/AreaModelObjectArray.md); `false` = not supported (the table logs a warning and changes nothing).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `unknown`[] | the new rows |
| `ctx` | [`AppendRowsContextIf`](AppendRowsContextIf.md)\<`unknown`\> | active filter, sort order, ring buffer size |

#### Returns

``false`` \| [`AppendRowsModelResultIf`](AppendRowsModelResultIf.md)

what changed, or false

**`Example`**

```ts
const result = bodyModel.appendRows?.(lines, { maxRows: 100_000 });
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:343](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L343)

___

### canMoveRows

▸ **canMoveRows**(`rowIndices`, `target`): `boolean`

Optional (row drag, managed mode): true if the rows can be moved to the target – e.g. false for a node dropped
into its own child, or while a filter hides rows. Without [moveRows](AreaModelIf.md#moverows) the table cannot move rows itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndices` | `number`[] | display indices of the dragged rows (ascending) |
| `target` | [`RowDropTargetIf`](RowDropTargetIf.md) | the drop target (display index before the move) |

#### Returns

`boolean`

true if [moveRows](AreaModelIf.md#moverows) would move them

**`Example`**

```ts
class TasksBodyModel extends AreaModel {
  tasks: string[] = ["Write", "Test", "Ship"];
  override getRowCount(): number { return this.tasks.length; }
  override getValueAt(rowIndex: number): any { return this.tasks[rowIndex]; }
  canMoveRows(rowIndices: number[], target: RowDropTargetIf): boolean { return target.position !== "inside"; }
  moveRows(rowIndices: number[], target: RowDropTargetIf): boolean {
    return moveArrayItems(this.tasks, rowIndices, getInsertBeforeIndex(target)) > -1;
  }
}
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:316](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L316)

___

### changeColumnOrder

▸ **changeColumnOrder**(`sourceColumnIndex`, `targetColumnIndex`): `void`

Changes the order of columns by moving a column from one position to another.
This method is called when the user drags a column to a new position.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sourceColumnIndex` | `number` | The index of the column to move |
| `targetColumnIndex` | `number` | The index where the column should be moved to |

#### Returns

`void`

**`Example`**

```ts
// Move the second column (index 1) to the fourth position (index 3)
areaModel.changeColumnOrder(1, 3);
```

**`Example`**

```ts
// Implementation example
changeColumnOrder(sourceColumnIndex: number, targetColumnIndex: number): void {
  // Move the column in the internal data structure
  this.arrayMove(this.columns, sourceColumnIndex, targetColumnIndex);
  
  // Update any dependent data structures
  this.arrayMove(this.cellRenderers, sourceColumnIndex, targetColumnIndex);
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:209](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L209)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the rows in this area based on the provided sort items.
This method is called when the user clicks on a sortable column header.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](../classes/SortItem.md)[] | An array of sort items, each containing a column index and sort direction |

#### Returns

`boolean`

True if sorting was performed, false otherwise

**`Example`**

```ts
// Sort by the second column in ascending order
bodyAreaModel.doSort([{ columnIndex: 1, sortState: 'asc' }]);

// Sort by the first column in descending order, then by the second column in ascending order
bodyAreaModel.doSort([
  { columnIndex: 0, sortState: 'desc' },
  { columnIndex: 1, sortState: 'asc' }
]);
```

**`Example`**

```ts
// Implementation example: a body model that sorts its own rows
class MyBodyModel extends AreaModelObjectArray<any> {
  override doSort(sortItems: SortItem[]): boolean {
    if (!sortItems.length) return false;
    
    // Apply sorting to the rows
    for (const sortItem of sortItems) {
      const { columnIndex, sortState } = sortItem;
      const property = this.columnDefs[columnIndex].property;
      const direction = sortState === 'asc' ? 1 : -1;
      
      this.rows.sort((a, b) => {
        const valueA = a[property];
        const valueB = b[property];
        
        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
    }
    
    return true;
  }
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:1048](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L1048)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`T`\>(`predictFn`): `void`

Applies a filter function to the rows in this area.
This method is called when a filter is applied to the table.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`T`\> | A function that takes a row and returns true if the row should be visible |

#### Returns

`void`

**`Example`**

```ts
// Filter rows where age > 30
bodyAreaModel.externalFilterChanged(row => row.age > 30);

// Clear all filters
bodyAreaModel.externalFilterChanged(() => true);
```

**`Example`**

```ts
// Implementation example
externalFilterChanged<T>(predictFn: FilterFunction<T>): void {
  // Apply the filter to the rows
  this.filteredRows = this.rows.filter(predictFn);
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:1003](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L1003)

___

### getCellRenderer

▸ **getCellRenderer**(`rowIndex`, `columnIndex`): `undefined` \| [`CellRendererIf`](CellRendererIf.md)

Returns a cell renderer for the cell at the specified row and column indices.
A cell renderer is responsible for rendering the cell content in a custom way.
If undefined is returned, the cell value will be rendered directly.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`undefined` \| [`CellRendererIf`](CellRendererIf.md)

A cell renderer instance, or undefined for default rendering

**`Example`**

```ts
// Get a custom renderer for a cell
const renderer = bodyAreaModel.getCellRenderer(1, 2);
```

**`Example`**

```ts
// Implementation example using column definitions
getCellRenderer(rowIndex: number, columnIndex: number): CellRendererIf | undefined {
  // Get renderer from column definition
  const columnDef = this.columnDefs[columnIndex];
  return columnDef?.rendererMap?.[this.areaIdent];
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:699](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L699)

___

### getColspanAt

▸ **getColspanAt**(`rowIndex`, `columnIndex`): `number`

Returns the column span value for the cell at the specified row and column indices.
A colspan value of N means the cell spans N columns horizontally.
Values less than 2 are ignored (no spanning).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`number`

The colspan value (number of columns the cell spans)

**`Example`**

```ts
// Check if a cell spans multiple columns
const colspan = headerAreaModel.getColspanAt(0, 0);
if (colspan > 1) {
  console.log(`This header cell spans ${colspan} columns`);
}
```

**`Example`**

```ts
// Implementation example for a model with column spanning
getColspanAt(rowIndex: number, columnIndex: number): number {
  // Special case: first row, first column spans 3 columns
  if (rowIndex === 0 && columnIndex === 0) return 3;
  
  // No spanning for other cells
  return 1;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:505](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L505)

___

### getConstantRowHeight

▸ **getConstantRowHeight**(): `undefined` \| `number`

Returns the row height if **all** rows of this area have the same height, otherwise `undefined`.

The renderer uses this value to find the first visible row directly instead of summing up the heights
of all rows above it – with millions of rows this keeps scrolling at the end of the table as fast as at
the beginning. Only return a number if `getRowHeight(i)` returns exactly this value for every row.
If the method is missing or returns `undefined`, the renderer falls back to iterating the row heights.
The height of the area (the scroll height of the body) is then this value × row count – O(1) – and wins over
`defaultRowHeights` of the table model (since 1.1.107; before, `defaultRowHeights` came first).

#### Returns

`undefined` \| `number`

The constant row height in pixels, or `undefined` if row heights may vary.

**`Example`**

```ts
// Custom area model with 34px rows:
getRowHeight(_rowIndex: number): number { return 34; }
getConstantRowHeight(): number | undefined { return 34; }
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:756](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L756)

___

### getCustomClassesAt

▸ **getCustomClassesAt**(`rowIndex`, `columnIndex`): `string`[]

Returns an array of CSS class names to apply to the cell at the specified row and column indices.
This method allows for custom styling of individual cells.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`string`[]

An array of CSS class names

**`Example`**

```ts
// Apply custom classes to cells
const classes = bodyAreaModel.getCustomClassesAt(1, 2);
console.log(`Cell classes: ${classes.join(', ')}`);
```

**`Example`**

```ts
// Implementation example with conditional styling
getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
  const classes: string[] = [];
  
  // Add classes based on row index
  if (rowIndex % 2 === 0) {
    classes.push('even-row');
  } else {
    classes.push('odd-row');
  }
  
  // Add classes based on cell value
  const value = this.getValueAt(rowIndex, columnIndex);
  if (typeof value === 'number' && value < 0) {
    classes.push('negative-value');
  }
  
  // Add classes for selected rows
  if (this.isRowChecked(rowIndex)) {
    classes.push('selected-row');
  }
  
  return classes;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:618](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L618)

___

### getCustomStyleAt

▸ **getCustomStyleAt**(`rowIndex`, `columnIndex`): `undefined` \| \{ `[key: string]`: `string`;  }

Returns an object containing CSS style properties to apply to the cell at the specified row and column indices.
This method allows for inline styling of individual cells.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`undefined` \| \{ `[key: string]`: `string`;  }

An object with CSS style properties, or undefined if no custom styles

**`Example`**

```ts
// Apply custom styles to cells
const styles = bodyAreaModel.getCustomStyleAt(1, 2);
console.log('Cell styles:', styles);
```

**`Example`**

```ts
// Implementation example with conditional styling
getCustomStyleAt(rowIndex: number, columnIndex: number): { [key: string]: string } | undefined {
  // Apply background color based on value
  const value = this.getValueAt(rowIndex, columnIndex);
  
  if (typeof value === 'number') {
    // Color gradient based on value
    if (value < 0) {
      return { 'background-color': `rgba(255, 0, 0, ${Math.min(Math.abs(value) / 100, 0.5)})` };
    } else if (value > 0) {
      return { 'background-color': `rgba(0, 255, 0, ${Math.min(value / 100, 0.5)})` };
    }
  }
  
  return undefined; // No custom styles
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:651](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L651)

___

### getInputValueAt

▸ **getInputValueAt**(`rowIndex`, `columnIndex`): `unknown`

Optional: the input of a cell – what was typed, e.g. the formula text of a cell formula (`"=B2*C2"`), while
[getValueAt](AreaModelIf.md#getvalueat) gives its result ([TableOptionsIf.cellFormulas](TableOptionsIf.md#cellformulas)). Editor, copy inside the table and undo
use it. Without it the input is the value. Implemented by the object-array and array models.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`unknown`

**`Example`**

```ts
tableModel.getBodyModel().getInputValueAt?.(0, 3);   // "=B2*C2"
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:406](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L406)

___

### getMaxColspan

▸ **getMaxColspan**(): `number`

Returns the maximum colspan value that can occur in this area model.
This value is used to optimize rendering performance.

#### Returns

`number`

The maximum possible colspan value in this area

**`Example`**

```ts
// Get the maximum colspan for optimization
const maxColspan = headerAreaModel.getMaxColspan();
```

**`Example`**

```ts
// Implementation example
getMaxColspan(): number {
  // If the model has no colspans, return 0 for optimization
  return 0;
  
  // If the model has colspans, return the maximum possible value
  // return 3; // If some cells span up to 3 columns
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:527](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L527)

___

### getMaxRowspan

▸ **getMaxRowspan**(): `number`

Returns the maximum rowspan value that can occur in this area model.
This value is used to optimize rendering performance.

#### Returns

`number`

The maximum possible rowspan value in this area

**`Example`**

```ts
// Get the maximum rowspan for optimization
const maxRowspan = bodyAreaModel.getMaxRowspan();
```

**`Example`**

```ts
// Implementation example
getMaxRowspan(): number {
  // If the model has no rowspans, return 0 for optimization
  return 0;
  
  // If the model has rowspans, return the maximum possible value
  // return 2; // If some cells span up to 2 rows
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:577](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L577)

___

### getRowByIndex

▸ **getRowByIndex**(`rowIndex`): `any`

Returns the row object at the specified index.
This method provides access to the underlying data structure.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |

#### Returns

`any`

The row object

**`Example`**

```ts
// Get a row object
const row = bodyAreaModel.getRowByIndex(1);
console.log('Row data:', row);
```

**`Example`**

```ts
// Implementation example for an array-based model
getRowByIndex(rowIndex: number): any {
  if (rowIndex < 0 || rowIndex >= this.data.length) return undefined;
  return this.data[rowIndex];
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:777](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L777)

___

### getRowCount

▸ **getRowCount**(): `number`

Returns the number of rows in this area.
This is a fundamental method that determines the vertical size of the area.

#### Returns

`number`

The number of rows in the area

**`Example`**

```ts
// Get the number of rows in the body area
const rowCount = bodyAreaModel.getRowCount();
console.log(`The body has ${rowCount} rows`);
```

**`Example`**

```ts
// Implementation example for an array-based model
getRowCount(): number {
  return this.data.length;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:273](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L273)

___

### getRowHeight

▸ **getRowHeight**(`rowIndex`): `number`

Returns the height of the row at the specified index, in pixels.
This method allows for variable row heights in the table.

The table draws the rows with these heights, and since 1.1.107 the height of the area (scroll height of the body,
height of header and footer) is their sum as well – [getConstantRowHeight](AreaModelIf.md#getconstantrowheight) × row count if given.
`defaultRowHeights` of the table model only counts if every row height is 0.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |

#### Returns

`number`

The height of the row in pixels

**`Example`**

```ts
// Get the height of a row
const height = bodyAreaModel.getRowHeight(1);
console.log(`Row 1 height: ${height}px`);
```

**`Example`**

```ts
// Implementation example with fixed row height
getRowHeight(rowIndex: number): number {
  return this.defaultRowHeight; // e.g., 30px
}
```

**`Example`**

```ts
// Implementation example with variable row heights
getRowHeight(rowIndex: number): number {
  // First row is taller
  if (rowIndex === 0) return 50;
  
  // Rows with more content are taller
  const row = this.getRowByIndex(rowIndex);
  if (row && row.hasLongContent) return 60;
  
  // Default height for other rows
  return 30;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:737](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L737)

___

### getRowValue

▸ **getRowValue**(`row`, `property`): `unknown`

Optional: the value of a column for a row object – computed for a calculated column, otherwise the property
path ([TableApi.getRowValue](../classes/TableApi.md#getrowvalue)). Implemented by the object-array, tree, row-group and pivot models.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `any` |
| `property` | `string` |

#### Returns

`unknown`

**`Example`**

```ts
tableModel.getBodyModel().getRowValue?.({ price: 25, quantity: 10 }, "total");   // 250
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:417](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L417)

___

### getRowspanAt

▸ **getRowspanAt**(`rowIndex`, `columnIndex`): `number`

Returns the row span value for the cell at the specified row and column indices.
A rowspan value of N means the cell spans N rows vertically.
Values less than 2 are ignored (no spanning).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`number`

The rowspan value (number of rows the cell spans)

**`Example`**

```ts
// Check if a cell spans multiple rows
const rowspan = bodyAreaModel.getRowspanAt(0, 0);
if (rowspan > 1) {
  console.log(`This cell spans ${rowspan} rows`);
}
```

**`Example`**

```ts
// Implementation example for a model with row spanning
getRowspanAt(rowIndex: number, columnIndex: number): number {
  // Special case: first column spans 2 rows at the beginning
  if (columnIndex === 0 && rowIndex % 2 === 0) return 2;
  
  // No spanning for other cells
  return 1;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:555](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L555)

___

### getTextValueAt

▸ **getTextValueAt**(`rowIndex`, `columnIndex`): `string`

Returns a string representation of the cell value at the specified row and column indices.
This method is used when exporting the table data or copying to clipboard.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`string`

The text value of the specified cell

**`Example`**

```ts
// Get the text value of a cell for export
const textValue = bodyAreaModel.getTextValueAt(1, 2);
```

**`Example`**

```ts
// Implementation example
getTextValueAt(rowIndex: number, columnIndex: number): string {
  const value = this.getValueAt(rowIndex, columnIndex);
  
  // Handle different data types appropriately
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:477](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L477)

___

### getTooltipAt

▸ **getTooltipAt**(`rowIndex`, `columnIndex`): `any`

Returns the tooltip text for the cell at the specified row and column indices.
This tooltip will be displayed when the user hovers over the cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`any`

The tooltip content (usually a string)

**`Example`**

```ts
// Get the tooltip for a cell
const tooltip = bodyAreaModel.getTooltipAt(1, 2);
```

**`Example`**

```ts
// Implementation example
getTooltipAt(rowIndex: number, columnIndex: number): any {
  // Use the cell value as the tooltip
  return this.getValueAt(rowIndex, columnIndex);
  
  // Or provide a more detailed tooltip
  // const value = this.getValueAt(rowIndex, columnIndex);
  // return `Value: ${value}\nRow: ${rowIndex}\nColumn: ${columnIndex}`;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:676](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L676)

___

### getUnfilteredRowCount

▸ **getUnfilteredRowCount**(): `number`

The number of rows the area would show **without** the external filter. Optional: the table uses it to tell
"No rows to show" (no rows at all) from "No matching rows" (the filter hides all rows) – see
[OverlayOptionsIf](OverlayOptionsIf.md). Models without it always get "No rows to show".

#### Returns

`number`

e.g. all rows of an object array; for a tree the displayed rows before filtering

**`Example`**

```ts
class OrdersBodyModel extends AreaModel {
  private all: string[][] = [];
  private shown: string[][] = [];
  override getRowCount(): number { return this.shown.length; }
  getUnfilteredRowCount(): number { return this.all.length; }
  override getValueAt(rowIndex: number, columnIndex: number): any { return this.shown[rowIndex]?.[columnIndex]; }
}
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:293](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L293)

___

### getValueAt

▸ **getValueAt**(`rowIndex`, `columnIndex`): `any`

Returns the value of the cell at the specified row and column indices.
This is one of the most important methods in the area model, as it provides
the actual data to be displayed in each cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`any`

The value at the specified cell

**`Example`**

```ts
// Get the value of a cell
const value = bodyAreaModel.getValueAt(1, 2);
console.log(`Cell (1,2) contains: ${value}`);
```

**`Example`**

```ts
// Implementation example for a 2D array model
getValueAt(rowIndex: number, columnIndex: number): any {
  if (rowIndex < 0 || rowIndex >= this.data.length) return undefined;
  const row = this.data[rowIndex];
  if (columnIndex < 0 || columnIndex >= row.length) return undefined;
  return row[columnIndex];
}
```

**`Example`**

```ts
// Implementation example for an object array model
getValueAt(rowIndex: number, columnIndex: number): any {
  const row = this.getRowByIndex(rowIndex);
  if (!row) return undefined;
  
  const property = this.columnDefs[columnIndex].property;
  return row[property];
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:452](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L452)

___

### getYPosByRowIndex

▸ **getYPosByRowIndex**(`rowIndex`): `number`

Returns the Y-coordinate (in pixels) of the top of the row at the specified index.
This method is used for scrolling and positioning rows in the viewport.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |

#### Returns

`number`

The Y-coordinate of the top of the row, in pixels

**`Example`**

```ts
// Get the Y-position of a row
const yPos = bodyAreaModel.getYPosByRowIndex(10);
console.log(`Row 10 starts at Y-position: ${yPos}px`);
```

**`Example`**

```ts
// Implementation example with fixed row heights
getYPosByRowIndex(rowIndex: number): number {
  return rowIndex * this.defaultRowHeight;
}
```

**`Example`**

```ts
// Implementation example with variable row heights
getYPosByRowIndex(rowIndex: number): number {
  // Use a pre-calculated array of Y-positions
  return this.yPositions[rowIndex];
  
  // Or calculate on-the-fly
  // let yPos = 0;
  // for (let i = 0; i < rowIndex; i++) {
  //   yPos += this.getRowHeight(i);
  // }
  // return yPos;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:811](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L811)

___

### init

▸ **init**(): `void`

Initializes the area model.
This method is called internally by the TableModel during initialization.
It can be used to perform any necessary setup, such as calculating row positions.

#### Returns

`void`

**`Example`**

```ts
// Implementation example
init(): void {
  // Calculate y-positions for all rows
  this.calculateYPositions();
  
  // Initialize any other internal state
  this.initialized = true;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L254)

___

### invalidateDerivedValues

▸ **invalidateDerivedValues**(`change?`): `void`

Optional: drops cached, derived values (e.g. the totals of an [AreaModelAggregateFooter](../classes/AreaModelAggregateFooter.md)). The table calls
it for all three areas when data may have changed: filter, sorting, editing, `updateCells()` and the public
`tableApi.repaint()` / `repaintHard()` – not on scrolling or internal repaints.

After an edit and `updateCells()` the table passes `change` (since 1.1.94): the area and the displayed rows that
changed – a model may recompute only what depends on them ([AreaModelRowGroups](../classes/AreaModelRowGroups.md) recomputes the groups of
these rows). Without `change` anything may have changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `change?` | [`DerivedValuesChangeIf`](DerivedValuesChangeIf.md) |

#### Returns

`void`

**`Example`**

```ts
class CachedTotalsFooter extends AreaModel {
  private total?: number;
  constructor(private readonly body: AreaModelObjectArray<Order>) {
    super();
    this.areaIdent = "footer";
  }
  invalidateDerivedValues(): void { this.total = undefined; }
  override getRowCount(): number { return 1; }
  override getValueAt(_row: number, _col: number): any {
    return this.total ??= this.body.getFilteredRows().reduce((sum, o) => sum + o.total, 0);
  }
}
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:370](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L370)

___

### isCalculatedProperty

▸ **isCalculatedProperty**(`property`): `boolean`

Optional: true if the column with this property is calculated (`ColumnDefIf.valueGetter` / `formula`).
Implemented by the object-array, tree, row-group and pivot models.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |

#### Returns

`boolean`

**`Example`**

```ts
tableModel.getBodyModel().isCalculatedProperty?.("total");   // true
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:394](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L394)

___

### isEditable

▸ **isEditable**(`rowIndex`, `columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is editable.
If true, the user can edit the cell content.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`boolean`

True if the cell is editable, false otherwise

**`Example`**

```ts
// Check if a cell is editable
const editable = bodyAreaModel.isEditable(1, 2);
if (editable) {
  console.log('This cell can be edited by the user');
}
```

**`Example`**

```ts
// Implementation example using column definitions
isEditable(rowIndex: number, columnIndex: number): boolean {
  // Get editability from column definition
  const columnDef = this.columnDefs[columnIndex];
  return columnDef?.editable?.() ?? false;
}
```

**`Example`**

```ts
// Implementation example with conditional editability
isEditable(rowIndex: number, columnIndex: number): boolean {
  // Header cells are not editable
  if (this.areaIdent === 'header') return false;
  
  // First column is not editable (e.g., ID column)
  if (columnIndex === 0) return false;
  
  // Other cells in the body are editable
  return this.areaIdent === 'body';
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:849](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L849)

___

### isFilterable

▸ **isFilterable**(): `boolean`

Determines whether this area supports filtering.
If true, the area can be filtered using the externalFilterChanged method.

#### Returns

`boolean`

True if the area is filterable, false otherwise

**`Example`**

```ts
// Check if an area is filterable
const filterable = bodyAreaModel.isFilterable();
if (filterable) {
  console.log('This area supports filtering');
}
```

**`Example`**

```ts
// Implementation example
isFilterable(): boolean {
  // Only the body area is filterable
  return this.areaIdent === 'body';
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:980](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L980)

___

### isRowCheckable

▸ **isRowCheckable**(`rowIndex`): `boolean`

Determines whether the row at the specified index is checkable.
If true, a checkbox will be rendered at the beginning of the row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |

#### Returns

`boolean`

True if the row is checkable, false otherwise

**`Example`**

```ts
// Check if a row is checkable
const checkable = bodyAreaModel.isRowCheckable(1);
if (checkable) {
  console.log('This row can be checked by the user');
}
```

**`Example`**

```ts
// Implementation example
isRowCheckable(rowIndex: number): boolean {
  // All rows are checkable by default
  return true;
  
  // Or implement custom logic
  // const row = this.getRowByIndex(rowIndex);
  // return row && !row.locked; // Only unlocked rows are checkable
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:904](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L904)

___

### isRowChecked

▸ **isRowChecked**(`rowIndex`): `undefined` \| [`CheckedType`](../modules.md#checkedtype)

Returns the checked state of the row at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |

#### Returns

`undefined` \| [`CheckedType`](../modules.md#checkedtype)

The checked state of the row (true, false, or 'indeterminate'),
                                  or undefined if the row is not checkable

**`Example`**

```ts
// Check if a row is checked
const checkedState = bodyAreaModel.isRowChecked(1);
if (checkedState === "full") {
  console.log('This row is checked');
} else if (checkedState === "semi") {
  console.log('This row is partially checked');
}
```

**`Example`**

```ts
// Implementation example using a row selection model
isRowChecked(rowIndex: number): CheckedType | undefined {
  if (!this.rowSelectionModel) return undefined;
  
  const row = this.getRowByIndex(rowIndex);
  return this.rowSelectionModel.isRowChecked(row);
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:931](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L931)

___

### isRowHeaderCell

▸ **isRowHeaderCell**(`rowIndex`, `columnIndex`): `boolean`

Optional: true for a cell that names its row (a label such as "Nord" or "Total") – the table gives it
`role="rowheader"` instead of `gridcell`, so screen readers announce it with the row.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`boolean`

**`Example`**

```ts
class LabeledBody extends AreaModel {
  isRowHeaderCell(_rowIndex: number, columnIndex: number): boolean { return columnIndex === 0; }
}
```

**`Since`**

1.1.94

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:383](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L383)

___

### isSelectable

▸ **isSelectable**(`rowIndex`, `columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is selectable.
If true, the user can select the cell: the table draws the selection only on selectable body cells.
All built-in models and [AreaModel](../classes/AreaModel.md) return `true` (except the hidden and cover-grid models).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`boolean`

True if the cell is selectable, false otherwise

**`Example`**

```ts
// Check if a cell is selectable
const selectable = bodyAreaModel.isSelectable(1, 2);
if (selectable) {
  console.log('This cell can be selected by the user');
}
```

**`Example`**

```ts
// Implementation example
isSelectable(rowIndex: number, columnIndex: number): boolean {
  // All cells are selectable by default
  return true;
  
  // Or implement custom logic
  // return this.areaIdent === 'body'; // Only body cells are selectable
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:877](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L877)

___

### moveRows

▸ **moveRows**(`rowIndices`, `target`): `boolean`

Optional (row drag, managed mode): moves the rows to the target in the model – the table calls it on a drop and
for `tableApi.moveRows()`, then repaints. Implemented by `AreaModelObjectArray`, `AreaModelArrayOfArrays` and
`AreaModelTree` (in place in their row arrays). See [canMoveRows](AreaModelIf.md#canmoverows) for an example.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndices` | `number`[] | display indices of the dragged rows (ascending) |
| `target` | [`RowDropTargetIf`](RowDropTargetIf.md) | the drop target (display index before the move) |

#### Returns

`boolean`

true if the rows were moved

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:329](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L329)

___

### setRowChecked

▸ **setRowChecked**(`rowIndex`, `checked`): `void`

Sets the checked state of the row at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `checked` | `boolean` | The new checked state |

#### Returns

`void`

**`Example`**

```ts
// Check a row
bodyAreaModel.setRowChecked(1, true);

// Uncheck a row
bodyAreaModel.setRowChecked(2, false);
```

**`Example`**

```ts
// Implementation example using a row selection model
setRowChecked(rowIndex: number, checked: boolean): void {
  if (!this.rowSelectionModel) return;
  
  const row = this.getRowByIndex(rowIndex);
  if (row) {
    this.rowSelectionModel.checkRow(row, checked);
  }
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:958](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L958)

___

### setValue

▸ **setValue**(`rowIndex`, `columnIndex`, `value`): `boolean`

Sets the value of a cell at the specified row and column indices.
This method is called when a cell is edited by the user or programmatically.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row containing the cell |
| `columnIndex` | `number` | The index of the column containing the cell |
| `value` | `any` | The new value to set |

#### Returns

`boolean`

- True if the value was successfully set, false otherwise

**`Example`**

```ts
// Set the value of a cell
areaModel.setValue(1, 2, "New Value");
```

**`Example`**

```ts
// Implementation example for an object-based model
setValue(rowIndex: number, columnIndex: number, value: any): boolean {
  const row = this.getRowByIndex(rowIndex);
  if (!row) return false;
  
  const property = this.columnDefs[columnIndex].property;
  row[property] = value;
  return true;
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:235](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L235)

___

### sort

▸ **sort**(`compareFn?`): `void`

Sorts the rows in this area using a custom comparator function.
This method provides more flexibility than doSort for complex sorting logic.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn?` | (`a`: `any`, `b`: `any`) => `number` | A function that compares two rows and returns a number: - Negative if a should come before b - Positive if a should come after b - Zero if they are equivalent for sorting purposes |

#### Returns

`void`

**`Example`**

```ts
// Sort rows by name length
bodyAreaModel.sort((a, b) => a.name.length - b.name.length);

// Sort rows by a computed value
bodyAreaModel.sort((a, b) => {
  const scoreA = a.wins * 3 + a.draws;
  const scoreB = b.wins * 3 + b.draws;
  return scoreB - scoreA; // Descending order
});
```

**`Example`**

```ts
// Implementation example
sort(compareFn?: (a: any, b: any) => number): void {
  if (!compareFn) return;
  
  // Apply the custom sort function
  this.rows.sort(compareFn);
}
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.if.ts:1080](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.if.ts#L1080)
