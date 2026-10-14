[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModel

# Class: AreaModel

Base class for area models of your own – every method of [AreaModelIf](../interfaces/AreaModelIf.md) has a sensible default,
override only what you need (at least [getRowCount](AreaModel.md#getrowcount), [getValueAt](AreaModel.md#getvalueat) and [getRowHeight](AreaModel.md#getrowheight)).

A table consists of three area models – header, body and footer ([AreaIdent](../modules.md#areaident)) – and asks them only for
the cells that are visible. That makes models possible that compute values on demand (millions of rows,
server data) or summarise other models (footer totals).

**`Example`**

```ts
// a body with two million rows – no array behind it
class TwoMillionRows extends AreaModel {
  constructor() {
    super();
    this.areaIdent = "body";
  }
  override getRowCount(): number { return 2_000_000; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getConstantRowHeight(): number { return 34; }   // all rows equally high → O(1) scrolling
  override getValueAt(row: number, col: number): any {
    return col === 0 ? row + 1 : `cell ${row}/${col}`;
  }
}
const tableModel = TableFactory.createTableModel({
  bodyAreaModel: new TwoMillionRows(),
  columnDefs: [new ColumnDef("id", "ID", px100, allRight), new ColumnDef("text", "Text", px200)]
});
```

**`Example`**

```ts
// a footer that sums the rows the body currently shows (after filter and sorting)
class TotalsFooter extends AreaModel {
  constructor(private readonly getBody: () => AreaModelObjectArray<Order>) {
    super();
    this.areaIdent = "footer";
  }
  override getRowCount(): number { return 1; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getValueAt(_row: number, col: number): any {
    const rows = this.getBody().getFilteredRows();
    return col === 0 ? `${rows.length} orders` : col === 5 ? rows.reduce((s, o) => s + o.total, 0) : "";
  }
}
```

**`See`**

 - [AreaModelObjectArray](AreaModelObjectArray.md) (objects), [AreaModelArrayOfArrays](AreaModelArrayOfArrays.md) (rows of values), [AreaModelTree](AreaModelTree.md) (trees)
 - Training: [The TableModel: three times three areas](https://gui.expert/training/table-model-areas/),
  [Own AreaModel: two million rows](https://gui.expert/training/custom-area-model/),
  [Footer totals](https://gui.expert/training/footer-totals/)

## Implements

- [`AreaModelIf`](../interfaces/AreaModelIf.md)

## Table of contents

### Constructors

- [constructor](AreaModel.md#constructor)

### Properties

- [areaIdent](AreaModel.md#areaident)
- [rowSelectionModel](AreaModel.md#rowselectionmodel)

### Methods

- [changeColumnOrder](AreaModel.md#changecolumnorder)
- [doSort](AreaModel.md#dosort)
- [externalFilterChanged](AreaModel.md#externalfilterchanged)
- [getCellRenderer](AreaModel.md#getcellrenderer)
- [getColspanAt](AreaModel.md#getcolspanat)
- [getConstantRowHeight](AreaModel.md#getconstantrowheight)
- [getCustomClassesAt](AreaModel.md#getcustomclassesat)
- [getCustomStyleAt](AreaModel.md#getcustomstyleat)
- [getMaxColspan](AreaModel.md#getmaxcolspan)
- [getMaxRowspan](AreaModel.md#getmaxrowspan)
- [getRowByIndex](AreaModel.md#getrowbyindex)
- [getRowCount](AreaModel.md#getrowcount)
- [getRowHeight](AreaModel.md#getrowheight)
- [getRowspanAt](AreaModel.md#getrowspanat)
- [getTextValueAt](AreaModel.md#gettextvalueat)
- [getTooltipAt](AreaModel.md#gettooltipat)
- [getValueAt](AreaModel.md#getvalueat)
- [getYPosByRowIndex](AreaModel.md#getyposbyrowindex)
- [init](AreaModel.md#init)
- [isEditable](AreaModel.md#iseditable)
- [isFilterable](AreaModel.md#isfilterable)
- [isRowCheckable](AreaModel.md#isrowcheckable)
- [isRowChecked](AreaModel.md#isrowchecked)
- [isSelectable](AreaModel.md#isselectable)
- [setRowChecked](AreaModel.md#setrowchecked)
- [setValue](AreaModel.md#setvalue)
- [sort](AreaModel.md#sort)

## Constructors

### constructor

• **new AreaModel**(): [`AreaModel`](AreaModel.md)

#### Returns

[`AreaModel`](AreaModel.md)

## Properties

### areaIdent

• **areaIdent**: [`AreaIdent`](../modules.md#areaident) = `"body"`

The identifier for one of the areas: header, body, footer.
This property determines which area of the table this model represents.
Default value is "body".

**`Example`**

```ts
// Creating an area model for the header
const headerModel = new AreaModel();
headerModel.areaIdent = "header";
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[areaIdent](../interfaces/AreaModelIf.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L73)

___

### rowSelectionModel

• **rowSelectionModel**: `undefined` \| [`CheckboxModelIf`](../interfaces/CheckboxModelIf.md)\<`any`\> = `undefined`

A model and controller for row checkbox selection.
This property allows the area to support row selection via checkboxes.
Default value is undefined (no row selection).

**`Example`**

```ts
// Creating a checkbox model for row selection
import { CheckboxModel } from "@guiexpert/table";

const bodyModel = new AreaModel();
bodyModel.rowSelectionModel = new CheckboxModel();
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[rowSelectionModel](../interfaces/AreaModelIf.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L89)

## Methods

### changeColumnOrder

▸ **changeColumnOrder**(`_sourceColumnIndex`, `_targetColumnIndex`): `void`

Changes the order of columns by moving a column from one position to another.
This method is called when the user drags a column to a new position.
The base implementation does nothing and should be overridden by subclasses
that support column reordering.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_sourceColumnIndex` | `number` | The index of the column to move |
| `_targetColumnIndex` | `number` | The index where the column should be moved to |

#### Returns

`void`

**`Example`**

```ts
// Override in a subclass to implement column reordering
changeColumnOrder(sourceColumnIndex: number, targetColumnIndex: number): void {
  // Move the column in the internal data structure
  this.arrayMove(this.columns, sourceColumnIndex, targetColumnIndex);
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[changeColumnOrder](../interfaces/AreaModelIf.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L108)

___

### doSort

▸ **doSort**(`_sortItems`): `boolean`

Sorts the rows in this area based on the provided sort items.
Called when the user double-clicks a sortable column header (and by [TableApi.sortByColumn](TableApi.md#sortbycolumn)).
The base implementation returns false (no sorting performed) and should be
overridden by subclasses that hold their rows themselves.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_sortItems` | [`SortItem`](SortItem.md)[] | An array of sort items, each containing a column index and sort direction |

#### Returns

`boolean`

True if sorting was performed, false otherwise

**`Example`**

```ts
class SortableRows extends AreaModel {
  constructor(private readonly rows: any[][]) {
    super();
    this.areaIdent = "body";
  }
  override getRowCount(): number { return this.rows.length; }
  override getValueAt(row: number, col: number): any { return this.rows[row][col]; }

  override doSort(sortItems: SortItem[]): boolean {
    if (!sortItems.length) return false;
    const { columnIndex, sortState } = sortItems[0];
    const direction = sortState === "asc" ? 1 : -1;
    this.rows.sort((a, b) => (a[columnIndex] < b[columnIndex] ? -1 : a[columnIndex] > b[columnIndex] ? 1 : 0) * direction);
    return true;
  }
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[doSort](../interfaces/AreaModelIf.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L139)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`T`\>(`_predictFn`): `void`

Applies a filter function to the rows in this area.
This method is called when a filter is applied to the table.
The base implementation does nothing and should be overridden by subclasses
that support filtering.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`T`\> | A function that takes a row and returns true if the row should be visible |

#### Returns

`void`

**`Example`**

```ts
// Override in a subclass to implement filtering
externalFilterChanged<T>(predictFn: FilterFunction<T>): void {
  // Apply the filter to the rows
  this.filteredRows = this.rows.filter(predictFn);
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[externalFilterChanged](../interfaces/AreaModelIf.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L184)

___

### getCellRenderer

▸ **getCellRenderer**(`_rowIndex`, `_columnIndex`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

Returns a cell renderer for the cell at the specified row and column indices.
A cell renderer is responsible for rendering the cell content in a custom way.
The base implementation returns undefined (default rendering) and should be
overridden by subclasses that support custom cell rendering.

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
// Override in a subclass to provide custom cell renderers
getCellRenderer(rowIndex: number, columnIndex: number): CellRendererIf | undefined {
  // Get renderer from column definition
  const columnDef = this.columnDefs[columnIndex];
  return columnDef?.rendererMap?.[this.areaIdent];
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getCellRenderer](../interfaces/AreaModelIf.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:206](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L206)

___

### getColspanAt

▸ **getColspanAt**(`_rowIndex`, `_columnIndex`): `number`

Returns the column span value for the cell at the specified row and column indices.
A colspan value of N means the cell spans N columns horizontally.
The base implementation returns 0 (no spanning) and should be overridden by
subclasses that support column spanning.

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
// Override in a subclass to implement column spanning
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L230)

___

### getConstantRowHeight

▸ **getConstantRowHeight**(): `undefined` \| `number`

Returns the row height if all rows have the same height, otherwise `undefined` (default).
Override it together with `getRowHeight()` if your rows have a constant height – this makes rendering
of very large tables independent of the scroll position.

#### Returns

`undefined` \| `number`

`undefined` in the base implementation.

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getConstantRowHeight](../interfaces/AreaModelIf.md#getconstantrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:564](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L564)

___

### getCustomClassesAt

▸ **getCustomClassesAt**(`_rowIndex`, `_columnIndex`): `string`[]

Returns an array of CSS class names to apply to the cell at the specified row and column indices.
This method allows for custom styling of individual cells.
The base implementation returns an empty array (no custom classes) and should be
overridden by subclasses that support custom cell styling.

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
// Override in a subclass to implement custom cell classes
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
  
  return classes;
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getCustomClassesAt](../interfaces/AreaModelIf.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:265](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L265)

___

### getCustomStyleAt

▸ **getCustomStyleAt**(`_rowIndex`, `_columnIndex`): `undefined` \| \{ `[p: string]`: `string`;  }

Returns an object containing CSS style properties to apply to the cell at the specified row and column indices.
This method allows for inline styling of individual cells.
The base implementation returns undefined (no custom styles) and should be
overridden by subclasses that support custom cell styling.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

#### Returns

`undefined` \| \{ `[p: string]`: `string`;  }

An object with CSS style properties, or undefined if no custom styles

**`Example`**

```ts
// Override in a subclass to implement custom cell styles
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:297](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L297)

___

### getMaxColspan

▸ **getMaxColspan**(): `number`

Returns the maximum colspan value that can occur in this area model.
This value is used to optimize rendering performance.
The base implementation returns 0 (no colspans) and should be overridden by
subclasses that support column spanning.

#### Returns

`number`

The maximum possible colspan value in this area

**`Example`**

```ts
// Override in a subclass to specify maximum colspan
getMaxColspan(): number {
  // If the model has colspans, return the maximum possible value
  return 3; // If some cells span up to 3 columns
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getMaxColspan](../interfaces/AreaModelIf.md#getmaxcolspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:316](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L316)

___

### getMaxRowspan

▸ **getMaxRowspan**(): `number`

Returns the maximum rowspan value that can occur in this area model.
This value is used to optimize rendering performance.
The base implementation returns 0 (no rowspans) and should be overridden by
subclasses that support row spanning.

#### Returns

`number`

The maximum possible rowspan value in this area

**`Example`**

```ts
// Override in a subclass to specify maximum rowspan
getMaxRowspan(): number {
  // If the model has rowspans, return the maximum possible value
  return 2; // If some cells span up to 2 rows
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getMaxRowspan](../interfaces/AreaModelIf.md#getmaxrowspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:335](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L335)

___

### getRowByIndex

▸ **getRowByIndex**(`_rowIndex`): `any`

Returns the row object at the specified index.
This method provides access to the underlying data structure.
The base implementation returns undefined and should be overridden by
subclasses that have a row-based data structure.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

#### Returns

`any`

The row object, or undefined if the row doesn't exist

**`Example`**

```ts
// Override in a subclass to provide access to row data
getRowByIndex(rowIndex: number): any {
  if (rowIndex < 0 || rowIndex >= this.data.length) return undefined;
  return this.data[rowIndex];
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowByIndex](../interfaces/AreaModelIf.md#getrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:355](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L355)

___

### getRowCount

▸ **getRowCount**(): `number`

Returns the number of rows in this area.
This is a fundamental method that determines the vertical size of the area.
The base implementation returns 0 (no rows) and should be overridden by
all subclasses.

#### Returns

`number`

The number of rows in the area

**`Example`**

```ts
// Override in a subclass to provide the row count
getRowCount(): number {
  return this.data.length;
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowCount](../interfaces/AreaModelIf.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:372](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L372)

___

### getRowHeight

▸ **getRowHeight**(`_rowIndex`): `number`

Returns the height of the row at the specified index, in pixels.
This method allows for variable row heights in the table.
The base implementation returns 0 and should be overridden by
all subclasses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

#### Returns

`number`

The height of the row in pixels

**`Example`**

```ts
// Override in a subclass to provide fixed row heights
getRowHeight(rowIndex: number): number {
  return 30; // 30px for all rows
}
```

**`Example`**

```ts
// Override in a subclass to provide variable row heights
getRowHeight(rowIndex: number): number {
  // First row is taller
  if (rowIndex === 0) return 50;
  
  // Default height for other rows
  return 30;
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[getRowHeight](../interfaces/AreaModelIf.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:401](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L401)

___

### getRowspanAt

▸ **getRowspanAt**(`_rowIndex`, `_columnIndex`): `number`

Returns the row span value for the cell at the specified row and column indices.
A rowspan value of N means the cell spans N rows vertically.
The base implementation returns 0 (no spanning) and should be overridden by
subclasses that support row spanning.

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
// Override in a subclass to implement row spanning
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:425](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L425)

___

### getTextValueAt

▸ **getTextValueAt**(`_rowIndex`, `_columnIndex`): `string`

Returns a string representation of the cell value at the specified row and column indices.
This method is used when exporting the table data or copying to clipboard.
The base implementation returns an empty string and should be overridden by
subclasses that need custom text conversion.

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
// Override in a subclass to provide text representation
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:509](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L509)

___

### getTooltipAt

▸ **getTooltipAt**(`_rowIndex`, `_columnIndex`): `any`

Returns the tooltip text for the cell at the specified row and column indices.
This tooltip will be displayed when the user hovers over the cell.
The base implementation returns undefined (no tooltip) and should be overridden by
subclasses that support tooltips.

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
// Override in a subclass to provide tooltips
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:450](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L450)

___

### getValueAt

▸ **getValueAt**(`_rowIndex`, `_columnIndex`): `any`

Returns the value of the cell at the specified row and column indices.
This is one of the most important methods in the area model, as it provides
the actual data to be displayed in each cell.
The base implementation returns undefined and should be overridden by
all subclasses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column |

#### Returns

`any`

The value at the specified cell

**`Example`**

```ts
// Override in a subclass for a 2D array model
getValueAt(rowIndex: number, columnIndex: number): any {
  if (rowIndex < 0 || rowIndex >= this.data.length) return undefined;
  const row = this.data[rowIndex];
  if (columnIndex < 0 || columnIndex >= row.length) return undefined;
  return row[columnIndex];
}
```

**`Example`**

```ts
// Override in a subclass for an object array model
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:484](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L484)

___

### getYPosByRowIndex

▸ **getYPosByRowIndex**(`rowIndex`): `number`

Returns the Y-coordinate (in pixels) of the top of the row at the specified index.
This method is used for scrolling and positioning rows in the viewport.
The base implementation computes it from `getConstantRowHeight()` (O(1)) or by summing up
`getRowHeight()` of all rows above (O(n)) – override it for large models with variable row heights.
(Before 1.1.85 the base implementation returned 0.)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |

#### Returns

`number`

The Y-coordinate of the top of the row, in pixels

**`Example`**

```ts
// Override in a subclass with fixed row heights
getYPosByRowIndex(rowIndex: number): number {
  return rowIndex * this.defaultRowHeight;
}
```

**`Example`**

```ts
// Override in a subclass with variable row heights
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:543](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L543)

___

### init

▸ **init**(): `void`

Initializes the area model.
This method is called internally by the TableModel during initialization.
It can be used to perform any necessary setup, such as calculating row positions.
The base implementation does nothing and can be overridden by
subclasses that need initialization.

#### Returns

`void`

**`Example`**

```ts
// Override in a subclass to perform initialization
init(): void {
  // Calculate y-positions for all rows
  this.yPositions = [];
  let currentY = 0;
  
  for (let i = 0; i < this.getRowCount(); i++) {
    this.yPositions[i] = currentY;
    currentY += this.getRowHeight(i);
  }
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[init](../interfaces/AreaModelIf.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:590](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L590)

___

### isEditable

▸ **isEditable**(`_rowIndex`, `_columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is editable.
If true, the user can edit the cell content.
The base implementation returns false (not editable) and should be overridden by
subclasses that support cell editing.

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
// Override in a subclass to implement cell editability
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:617](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L617)

___

### isFilterable

▸ **isFilterable**(): `boolean`

Determines whether this area supports filtering.
If true, the area can be filtered using the externalFilterChanged method.
The base implementation returns false (not filterable) and should be overridden by
subclasses that support filtering.

#### Returns

`boolean`

True if the area is filterable, false otherwise

**`Example`**

```ts
// Override in a subclass to enable filtering
isFilterable(): boolean {
  // Only the body area is filterable
  return this.areaIdent === 'body';
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isFilterable](../interfaces/AreaModelIf.md#isfilterable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:636](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L636)

___

### isRowCheckable

▸ **isRowCheckable**(`_rowIndex`): `boolean`

Determines whether the row at the specified index is checkable.
If true, a checkbox will be rendered at the beginning of the row.
The base implementation returns false (not checkable) and should be overridden by
subclasses that support row selection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

#### Returns

`boolean`

True if the row is checkable, false otherwise

**`Example`**

```ts
// Override in a subclass to implement row checkability
isRowCheckable(rowIndex: number): boolean {
  // All rows in the body are checkable
  if (this.areaIdent !== 'body') return false;
  
  // Except for special rows
  const row = this.getRowByIndex(rowIndex);
  return row && !row.locked;
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isRowCheckable](../interfaces/AreaModelIf.md#isrowcheckable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:660](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L660)

___

### isRowChecked

▸ **isRowChecked**(`_rowIndex`): `undefined` \| [`CheckedType`](../modules.md#checkedtype)

Returns the checked state of the row at the specified index.
The base implementation returns undefined (not checked) and should be overridden by
subclasses that support row selection.

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
// Override in a subclass to implement row checked state
isRowChecked(rowIndex: number): CheckedType | undefined {
  if (!this.rowSelectionModel) return undefined;
  
  const row = this.getRowByIndex(rowIndex);
  return this.rowSelectionModel.isRowChecked(row);
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isRowChecked](../interfaces/AreaModelIf.md#isrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:682](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L682)

___

### isSelectable

▸ **isSelectable**(`_rowIndex`, `_columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is selectable.
The table draws the selection (of the [SelectionModel](SelectionModel.md)) only on selectable body cells.

Default: `true` – all cells are selectable, like in all built-in area models
(up to 1.1.90 the default of `AreaModel` was `false`: a selection on an own model was not drawn).
Override it to exclude cells, e.g. a column of row numbers.

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
// Override in a subclass: the first column (row numbers) never shows a selection
override isSelectable(_rowIndex: number, columnIndex: number): boolean {
  return columnIndex > 0;
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[isSelectable](../interfaces/AreaModelIf.md#isselectable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:704](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L704)

___

### setRowChecked

▸ **setRowChecked**(`_rowIndex`, `_checked`): `void`

Sets the checked state of the row at the specified index.
The base implementation does nothing and should be overridden by
subclasses that support row selection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `_checked` | `boolean` | The new checked state |

#### Returns

`void`

**`Example`**

```ts
// Override in a subclass to implement row checking
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

[src/lib/table/data/tablemodel/areamodel/area-model.ts:728](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L728)

___

### setValue

▸ **setValue**(`_rowIndex`, `_columnIndex`, `_value`): `boolean`

Sets the value of a cell at the specified row and column indices.
This method is called when a cell is edited by the user or programmatically.
The base implementation returns false (value not set) and should be overridden by
subclasses that support cell editing.

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
// Override in a subclass to implement cell value setting
setValue(rowIndex: number, columnIndex: number, value: any): boolean {
  // Check if the cell is editable
  if (!this.isEditable(rowIndex, columnIndex)) return false;
  
  // For a 2D array model
  if (rowIndex >= 0 && rowIndex < this.data.length) {
    const row = this.data[rowIndex];
    if (columnIndex >= 0 && columnIndex < row.length) {
      row[columnIndex] = value;
      return true;
    }
  }
  
  return false;
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[setValue](../interfaces/AreaModelIf.md#setvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:761](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L761)

___

### sort

▸ **sort**(`_compareFn?`): `void`

Sorts the rows in this area using a custom comparator function.
This method provides more flexibility than doSort for complex sorting logic.
The base implementation does nothing and should be overridden by subclasses
that support custom sorting.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_compareFn?` | (`a`: `any`, `b`: `any`) => `number` | A function that compares two rows and returns a number: - Negative if a should come before b - Positive if a should come after b - Zero if they are equivalent for sorting purposes |

#### Returns

`void`

**`Example`**

```ts
// Override in a subclass to implement custom sorting
sort(compareFn?: (a: any, b: any) => number): void {
  if (!compareFn) return;
  
  // Apply the custom sort function
  this.rows.sort(compareFn);
}
```

#### Implementation of

[AreaModelIf](../interfaces/AreaModelIf.md).[sort](../interfaces/AreaModelIf.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L164)
