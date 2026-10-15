[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CoverGridBodyModel

# Class: CoverGridBodyModel\<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`AreaModelIf`](../interfaces/AreaModelIf.md)

## Table of contents

### Constructors

- [constructor](CoverGridBodyModel.md#constructor)

### Properties

- [areaIdent](CoverGridBodyModel.md#areaident)
- [cellRenderer](CoverGridBodyModel.md#cellrenderer)
- [coverHeight](CoverGridBodyModel.md#coverheight)
- [coverWidth](CoverGridBodyModel.md#coverwidth)
- [filteredItems](CoverGridBodyModel.md#filtereditems)
- [firstRowPaddingTop](CoverGridBodyModel.md#firstrowpaddingtop)
- [items](CoverGridBodyModel.md#items)
- [rowSelectionModel](CoverGridBodyModel.md#rowselectionmodel)
- [width](CoverGridBodyModel.md#width)

### Methods

- [arrayMove](CoverGridBodyModel.md#arraymove)
- [changeColumnOrder](CoverGridBodyModel.md#changecolumnorder)
- [doSort](CoverGridBodyModel.md#dosort)
- [externalFilterChanged](CoverGridBodyModel.md#externalfilterchanged)
- [getCellRenderer](CoverGridBodyModel.md#getcellrenderer)
- [getColspanAt](CoverGridBodyModel.md#getcolspanat)
- [getColumnCount](CoverGridBodyModel.md#getcolumncount)
- [getCustomClassesAt](CoverGridBodyModel.md#getcustomclassesat)
- [getCustomStyleAt](CoverGridBodyModel.md#getcustomstyleat)
- [getMaxColspan](CoverGridBodyModel.md#getmaxcolspan)
- [getMaxRowspan](CoverGridBodyModel.md#getmaxrowspan)
- [getRowByIndex](CoverGridBodyModel.md#getrowbyindex)
- [getRowCount](CoverGridBodyModel.md#getrowcount)
- [getRowHeight](CoverGridBodyModel.md#getrowheight)
- [getRowspanAt](CoverGridBodyModel.md#getrowspanat)
- [getTextValueAt](CoverGridBodyModel.md#gettextvalueat)
- [getTooltipAt](CoverGridBodyModel.md#gettooltipat)
- [getUnfilteredRowCount](CoverGridBodyModel.md#getunfilteredrowcount)
- [getValueAt](CoverGridBodyModel.md#getvalueat)
- [getYPosByRowIndex](CoverGridBodyModel.md#getyposbyrowindex)
- [init](CoverGridBodyModel.md#init)
- [isEditable](CoverGridBodyModel.md#iseditable)
- [isFilterable](CoverGridBodyModel.md#isfilterable)
- [isRowCheckable](CoverGridBodyModel.md#isrowcheckable)
- [isRowChecked](CoverGridBodyModel.md#isrowchecked)
- [isSelectable](CoverGridBodyModel.md#isselectable)
- [setParentWidth](CoverGridBodyModel.md#setparentwidth)
- [setPropertyValue](CoverGridBodyModel.md#setpropertyvalue)
- [setRowChecked](CoverGridBodyModel.md#setrowchecked)
- [setValue](CoverGridBodyModel.md#setvalue)
- [sort](CoverGridBodyModel.md#sort)

## Constructors

### constructor

• **new CoverGridBodyModel**\<`T`\>(`items`, `cellRenderer`, `coverWidth?`, `coverHeight?`, `width?`, `firstRowPaddingTop?`): [`CoverGridBodyModel`](CoverGridBodyModel.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `items` | `T`[] | `undefined` |
| `cellRenderer` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | `undefined` |
| `coverWidth` | `number` | `200` |
| `coverHeight` | `number` | `300` |
| `width` | `number` | `0` |
| `firstRowPaddingTop` | `number` | `0` |

#### Returns

[`CoverGridBodyModel`](CoverGridBodyModel.md)\<`T`\>

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L23)

## Properties

### areaIdent

• **areaIdent**: [`AreaIdent`](../modules.md#areaident) = `'body'`

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[areaIdent](../interfaces/AreaModelIf.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L14)

___

### cellRenderer

• **cellRenderer**: [`CellRendererIf`](../interfaces/CellRendererIf.md)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L25)

___

### coverHeight

• **coverHeight**: `number` = `300`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L27)

___

### coverWidth

• **coverWidth**: `number` = `200`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L26)

___

### filteredItems

• **filteredItems**: `T`[] = `[]`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L16)

___

### firstRowPaddingTop

• **firstRowPaddingTop**: `number` = `0`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L29)

___

### items

• **items**: `T`[]

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L24)

___

### rowSelectionModel

• **rowSelectionModel**: `undefined` \| [`CheckboxModelIf`](../interfaces/CheckboxModelIf.md)\<`any`\> = `undefined`

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[rowSelectionModel](../interfaces/AreaModelIf.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L13)

___

### width

• **width**: `number` = `0`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L28)

## Methods

### arrayMove

▸ **arrayMove**(`_arr`, `_fromIndex`, `_toIndex`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_arr` | `any`[] |
| `_fromIndex` | `number` |
| `_toIndex` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:177](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L177)

___

### changeColumnOrder

▸ **changeColumnOrder**(`_sourceColumnIndex`, `_targetColumnIndex`): `void`

Changes the order of columns by moving a column from one position to another.
This method is called when the user drags a column to a new position.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_sourceColumnIndex` | `number` | The index of the column to move |
| `_targetColumnIndex` | `number` | The index where the column should be moved to |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[changeColumnOrder](../interfaces/AreaModelIf.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:169](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L169)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the rows in this area based on the provided sort items.
This method is called when the user clicks on a sortable column header.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | An array of sort items, each containing a column index and sort direction |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[doSort](../interfaces/AreaModelIf.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L139)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`_T`\>(`predict`): `void`

Applies a filter function to the rows in this area.
This method is called when a filter is applied to the table.

#### Type parameters

| Name |
| :------ |
| `_T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predict` | [`FilterFunction`](../modules.md#filterfunction)\<`any`\> | A function that takes a row and returns true if the row should be visible |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[externalFilterChanged](../interfaces/AreaModelIf.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L131)

___

### getCellRenderer

▸ **getCellRenderer**(`_rowIndex`, `_columnIndex`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

Returns a cell renderer for the cell at the specified row and column indices.
A cell renderer is responsible for rendering the cell content in a custom way.
If undefined is returned, the cell value will be rendered directly.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

#### Returns

`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getCellRenderer](../interfaces/AreaModelIf.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L76)

___

### getColspanAt

▸ **getColspanAt**(`_rowIndex`, `_columnIndex`): `number`

Returns the column span value for the cell at the specified row and column indices.
A colspan value of N means the cell spans N columns horizontally.
Values less than 2 are ignored (no spanning).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getColspanAt](../interfaces/AreaModelIf.md#getcolspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L80)

___

### getColumnCount

▸ **getColumnCount**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L54)

___

### getCustomClassesAt

▸ **getCustomClassesAt**(`_rowIndex`, `_columnIndex`): `string`[]

Returns an array of CSS class names to apply to the cell at the specified row and column indices.
This method allows for custom styling of individual cells.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getCustomClassesAt](../interfaces/AreaModelIf.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L84)

___

### getCustomStyleAt

▸ **getCustomStyleAt**(`_rowIndex`, `_columnIndex`): `undefined` \| \{ `[key: string]`: `string`;  }

Returns an object containing CSS style properties to apply to the cell at the specified row and column indices.
This method allows for inline styling of individual cells.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getCustomStyleAt](../interfaces/AreaModelIf.md#getcustomstyleat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L88)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getMaxColspan](../interfaces/AreaModelIf.md#getmaxcolspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L112)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getMaxRowspan](../interfaces/AreaModelIf.md#getmaxrowspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L116)

___

### getRowByIndex

▸ **getRowByIndex**(`_rowIndex`): `any`

Returns the row object at the specified index.
This method provides access to the underlying data structure.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowByIndex](../interfaces/AreaModelIf.md#getrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L96)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowCount](../interfaces/AreaModelIf.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L38)

___

### getRowHeight

▸ **getRowHeight**(`rowIndex`): `number`

Returns the height of the row at the specified index, in pixels.
This method allows for variable row heights in the table.

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowHeight](../interfaces/AreaModelIf.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L70)

___

### getRowspanAt

▸ **getRowspanAt**(`_rowIndex`, `_columnIndex`): `number`

Returns the row span value for the cell at the specified row and column indices.
A rowspan value of N means the cell spans N rows vertically.
Values less than 2 are ignored (no spanning).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowspanAt](../interfaces/AreaModelIf.md#getrowspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L92)

___

### getTextValueAt

▸ **getTextValueAt**(`_rowIndex`, `_columnIndex`): `string`

Returns a string representation of the cell value at the specified row and column indices.
This method is used when exporting the table data or copying to clipboard.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getTextValueAt](../interfaces/AreaModelIf.md#gettextvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L62)

___

### getTooltipAt

▸ **getTooltipAt**(`_rowIndex`, `_columnIndex`): `any`

Returns the tooltip text for the cell at the specified row and column indices.
This tooltip will be displayed when the user hovers over the cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getTooltipAt](../interfaces/AreaModelIf.md#gettooltipat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L66)

___

### getUnfilteredRowCount

▸ **getUnfilteredRowCount**(): `number`

The number of grid rows without the external filter (`0` without items).

#### Returns

`number`

grid rows for all items

**`Since`**

1.1.92

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getUnfilteredRowCount](../interfaces/AreaModelIf.md#getunfilteredrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L49)

___

### getValueAt

▸ **getValueAt**(`rowIndex`, `columnIndex`): `undefined` \| `T`

Returns the value of the cell at the specified row and column indices.
This is one of the most important methods in the area model, as it provides
the actual data to be displayed in each cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`undefined` \| `T`

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getValueAt](../interfaces/AreaModelIf.md#getvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L58)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getYPosByRowIndex](../interfaces/AreaModelIf.md#getyposbyrowindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L121)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[init](../interfaces/AreaModelIf.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L127)

___

### isEditable

▸ **isEditable**(`_rowIndex`, `_columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is editable.
If true, the user can edit the cell content.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isEditable](../interfaces/AreaModelIf.md#iseditable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:156](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L156)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isFilterable](../interfaces/AreaModelIf.md#isfilterable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:135](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L135)

___

### isRowCheckable

▸ **isRowCheckable**(`_rowIndex`): `boolean`

Determines whether the row at the specified index is checkable.
If true, a checkbox will be rendered at the beginning of the row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isRowCheckable](../interfaces/AreaModelIf.md#isrowcheckable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L100)

___

### isRowChecked

▸ **isRowChecked**(`_rowIndex`): `undefined` \| [`CheckedType`](../modules.md#checkedtype)

Returns the checked state of the row at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isRowChecked](../interfaces/AreaModelIf.md#isrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L104)

___

### isSelectable

▸ **isSelectable**(`_rowIndex`, `_columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is selectable.
If true, the user can select the cell: the table draws the selection only on selectable body cells.
All built-in models and [AreaModel](AreaModel.md) return `true` (except the hidden and cover-grid models).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isSelectable](../interfaces/AreaModelIf.md#isselectable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L165)

___

### setParentWidth

▸ **setParentWidth**(`widthInPixel`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `widthInPixel` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L34)

___

### setPropertyValue

▸ **setPropertyValue**(`_o`, `_props`, `_value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_o` | `any` |
| `_props` | `string`[] |
| `_value` | `any` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:173](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L173)

___

### setRowChecked

▸ **setRowChecked**(`_rowIndex`, `_checked`): `void`

Sets the checked state of the row at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_checked` | `boolean` | The new checked state |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[setRowChecked](../interfaces/AreaModelIf.md#setrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L108)

___

### setValue

▸ **setValue**(`_rowIndex`, `_columnIndex`, `_value`): `boolean`

Sets the value of a cell at the specified row and column indices.
This method is called when a cell is edited by the user or programmatically.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row containing the cell |
| `_columnIndex` | `number` | The index of the column containing the cell |
| `_value` | `any` | The new value to set |

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[setValue](../interfaces/AreaModelIf.md#setvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L160)

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

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[sort](../interfaces/AreaModelIf.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts:151](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts#L151)
