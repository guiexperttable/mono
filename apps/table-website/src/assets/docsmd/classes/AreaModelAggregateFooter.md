[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelAggregateFooter

# Class: AreaModelAggregateFooter\<T\>

A ready-made footer with totals (sum, average, count, …) that follow filter and sorting – without an own
[AreaModel](AreaModel.md). One or more total rows; every aggregate belongs to the column with the same **property**
(column order, row numbers and the checkbox column don't matter). The easiest way is the factory option
`footerAggregates` of [TableFactory.createTableModel](TableFactory.md#createtablemodel).

- **Data**: the rows the body shows (`getFilteredRows()`), in a tree all leaves the filter keeps (expanded or not),
  in other models every row via `getValueAt` of the column. Options `source: "all"` and `getRows` change that.
- **Cells**: the value is the raw result (a number stays a number – Excel export, own footer renderers); the text is
  formatted (`format` of the spec, otherwise [formatAggregateValue](../modules.md#formataggregatevalue)). A footer renderer of the column
  (`rendererMap.footer`) gets the raw value; without it the [AggregateCellRenderer](AggregateCellRenderer.md) writes the text.
- **Label**: `"6 rows"` (or the row's `label`) in the first data column without an aggregate, or in `labelProperty`;
  screen readers announce it as row header.
- **Cache**: computed once per change of the data, not per repaint or scroll frame. The table drops the cache when
  it filters, sorts, edits, gets `updateCells()` or `tableApi.repaint()` / `repaintHard()` – after changing row
  objects yourself call `tableApi.repaint()`, as for the cells.

**`Example`**

```ts
// one line: totals of quantity and total – the label "100,000 rows" goes into the first column without aggregate
const tableModel = TableFactory.createTableModel({
  rows: orders,
  columnDefs,
  footerAggregates: { quantity: "sum", total: "sum" }
});
```

**`Example`**

```ts
// two total rows with own labels, an own body model
const footer = new AreaModelAggregateFooter<Order>(() => tableModel.getBodyModel(), columnDefs, [
  { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
  { label: (rowCount: number) => `Ø of ${rowCount}`, aggregates: { quantity: "avg", total: "avg" } }
]);
const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, footerAreaModel: footer });
```

**`Example`**

```ts
// read the results, e.g. for a title
const footer = tableModel.getAreaModel("footer") as AreaModelAggregateFooter<Order>;
const { total } = footer.getResults();           // { total: 27481033.5, … }
```

**`See`**

 - [aggregateColumns](../modules.md#aggregatecolumns) (the same without a table), [TableApi.getSelectionAggregates](TableApi.md#getselectionaggregates) (selected cells)
 - Training: [Footer totals](https://gui.expert/training/footer-totals/)

**`Since`**

1.1.94

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Hierarchy

- [`AreaModel`](AreaModel.md)

  ↳ **`AreaModelAggregateFooter`**

## Implements

- [`HasDefaultRowHeightIf`](../interfaces/HasDefaultRowHeightIf.md)

## Table of contents

### Constructors

- [constructor](AreaModelAggregateFooter.md#constructor)

### Properties

- [areaIdent](AreaModelAggregateFooter.md#areaident)
- [defaultRowHeight](AreaModelAggregateFooter.md#defaultrowheight)
- [rowSelectionModel](AreaModelAggregateFooter.md#rowselectionmodel)
- [type](AreaModelAggregateFooter.md#type)

### Methods

- [changeColumnOrder](AreaModelAggregateFooter.md#changecolumnorder)
- [doSort](AreaModelAggregateFooter.md#dosort)
- [externalFilterChanged](AreaModelAggregateFooter.md#externalfilterchanged)
- [getAggregationRowCount](AreaModelAggregateFooter.md#getaggregationrowcount)
- [getCellRenderer](AreaModelAggregateFooter.md#getcellrenderer)
- [getColspanAt](AreaModelAggregateFooter.md#getcolspanat)
- [getConstantRowHeight](AreaModelAggregateFooter.md#getconstantrowheight)
- [getCustomClassesAt](AreaModelAggregateFooter.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelAggregateFooter.md#getcustomstyleat)
- [getLabel](AreaModelAggregateFooter.md#getlabel)
- [getLabelColumnIndex](AreaModelAggregateFooter.md#getlabelcolumnindex)
- [getMaxColspan](AreaModelAggregateFooter.md#getmaxcolspan)
- [getMaxRowspan](AreaModelAggregateFooter.md#getmaxrowspan)
- [getResults](AreaModelAggregateFooter.md#getresults)
- [getRowByIndex](AreaModelAggregateFooter.md#getrowbyindex)
- [getRowCount](AreaModelAggregateFooter.md#getrowcount)
- [getRowHeight](AreaModelAggregateFooter.md#getrowheight)
- [getRowspanAt](AreaModelAggregateFooter.md#getrowspanat)
- [getTextValueAt](AreaModelAggregateFooter.md#gettextvalueat)
- [getTooltipAt](AreaModelAggregateFooter.md#gettooltipat)
- [getValueAt](AreaModelAggregateFooter.md#getvalueat)
- [getYPosByRowIndex](AreaModelAggregateFooter.md#getyposbyrowindex)
- [init](AreaModelAggregateFooter.md#init)
- [invalidateDerivedValues](AreaModelAggregateFooter.md#invalidatederivedvalues)
- [isEditable](AreaModelAggregateFooter.md#iseditable)
- [isFilterable](AreaModelAggregateFooter.md#isfilterable)
- [isLabelCell](AreaModelAggregateFooter.md#islabelcell)
- [isRowCheckable](AreaModelAggregateFooter.md#isrowcheckable)
- [isRowChecked](AreaModelAggregateFooter.md#isrowchecked)
- [isSelectable](AreaModelAggregateFooter.md#isselectable)
- [setRowChecked](AreaModelAggregateFooter.md#setrowchecked)
- [setValue](AreaModelAggregateFooter.md#setvalue)
- [sort](AreaModelAggregateFooter.md#sort)
- [toOptions](AreaModelAggregateFooter.md#tooptions)

## Constructors

### constructor

• **new AreaModelAggregateFooter**\<`T`\>(`body`, `columnDefs`, `config`): [`AreaModelAggregateFooter`](AreaModelAggregateFooter.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `body` | [`AreaModelIf`](../interfaces/AreaModelIf.md) \| () => [`AreaModelIf`](../interfaces/AreaModelIf.md) | the body model, or a function that returns it (if the footer is created before the table model, e.g. `() => tableModel.getBodyModel()`) |
| `columnDefs` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] | the column definitions of the table (the same array – columns are found by property) |
| `config` | [`AggregateFooterConfig`](../modules.md#aggregatefooterconfig)\<`T`\> | `{ total: "sum" }` (one row), `[{ label, aggregates }, …]` (several rows) or full [AggregateFooterOptionsIf](../interfaces/AggregateFooterOptionsIf.md) |

#### Returns

[`AreaModelAggregateFooter`](AreaModelAggregateFooter.md)\<`T`\>

#### Overrides

[AreaModel](AreaModel.md).[constructor](AreaModel.md#constructor)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L110)

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

#### Inherited from

[AreaModel](AreaModel.md).[areaIdent](AreaModel.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L73)

___

### defaultRowHeight

• **defaultRowHeight**: `number`

Height of the footer rows in px (`rowHeight` of the options, default 34).

#### Implementation of

[HasDefaultRowHeightIf](../interfaces/HasDefaultRowHeightIf.md).[defaultRowHeight](../interfaces/HasDefaultRowHeightIf.md#defaultrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L95)

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

#### Inherited from

[AreaModel](AreaModel.md).[rowSelectionModel](AreaModel.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L89)

___

### type

• `Readonly` **type**: ``"AreaModelAggregateFooter"``

Marker (works across copies of the core): [isAreaModelAggregateFooter](../modules.md#isareamodelaggregatefooter).

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L92)

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

#### Inherited from

[AreaModel](AreaModel.md).[changeColumnOrder](AreaModel.md#changecolumnorder)

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

#### Inherited from

[AreaModel](AreaModel.md).[doSort](AreaModel.md#dosort)

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

#### Inherited from

[AreaModel](AreaModel.md).[externalFilterChanged](AreaModel.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L184)

___

### getAggregationRowCount

▸ **getAggregationRowCount**(): `number`

The number of aggregated rows (e.g. the filtered body rows; in a tree the leaves).

#### Returns

`number`

the number of rows the results are based on

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:181](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L181)

___

### getCellRenderer

▸ **getCellRenderer**(`rowIndex`, `columnIndex`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

The renderer of a cell: for a result the footer renderer of the column (it gets the raw value), otherwise – and for
the label – an [AggregateCellRenderer](AggregateCellRenderer.md) that writes [getTextValueAt](AreaModelAggregateFooter.md#gettextvalueat) as text.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

#### Overrides

[AreaModel](AreaModel.md).[getCellRenderer](AreaModel.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:229](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L229)

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

#### Inherited from

[AreaModel](AreaModel.md).[getColspanAt](AreaModel.md#getcolspanat)

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

#### Overrides

[AreaModel](AreaModel.md).[getConstantRowHeight](AreaModel.md#getconstantrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L146)

___

### getCustomClassesAt

▸ **getCustomClassesAt**(`rowIndex`, `columnIndex`): `string`[]

Returns an array of CSS class names to apply to the cell at the specified row and column indices.
This method allows for custom styling of individual cells.
The base implementation returns an empty array (no custom classes) and should be
overridden by subclasses that support custom cell styling.

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

#### Overrides

[AreaModel](AreaModel.md).[getCustomClassesAt](AreaModel.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:241](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L241)

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

#### Inherited from

[AreaModel](AreaModel.md).[getCustomStyleAt](AreaModel.md#getcustomstyleat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:297](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L297)

___

### getLabel

▸ **getLabel**(`rowIndex`): `string`

The label text of a footer row.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`string`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:267](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L267)

___

### getLabelColumnIndex

▸ **getLabelColumnIndex**(`rowIndex`): `number`

The label column of a footer row, -1 for none.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:256](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L256)

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

#### Inherited from

[AreaModel](AreaModel.md).[getMaxColspan](AreaModel.md#getmaxcolspan)

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

#### Inherited from

[AreaModel](AreaModel.md).[getMaxRowspan](AreaModel.md#getmaxrowspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:335](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L335)

___

### getResults

▸ **getResults**(`rowIndex?`): `Record`\<`string`, `unknown`\>

The results of a footer row by key (also of keys without a column).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowIndex?` | `number` | `0` | the footer row |

#### Returns

`Record`\<`string`, `unknown`\>

key → result (`{}` for a row that does not exist); do not modify it

**`Example`**

```ts
const footer = tableModel.getAreaModel("footer") as AreaModelAggregateFooter<Order>;
document.title = `${formatAggregateValue(footer.getResults().total)} € in ${footer.getAggregationRowCount()} orders`;
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:172](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L172)

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

#### Inherited from

[AreaModel](AreaModel.md).[getRowByIndex](AreaModel.md#getrowbyindex)

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

#### Overrides

[AreaModel](AreaModel.md).[getRowCount](AreaModel.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:138](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L138)

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

#### Overrides

[AreaModel](AreaModel.md).[getRowHeight](AreaModel.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L142)

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

#### Inherited from

[AreaModel](AreaModel.md).[getRowspanAt](AreaModel.md#getrowspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:425](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L425)

___

### getTextValueAt

▸ **getTextValueAt**(`rowIndex`, `columnIndex`): `string`

Returns a string representation of the cell value at the specified row and column indices.
This method is used when exporting the table data or copying to clipboard.
The base implementation returns an empty string and should be overridden by
subclasses that need custom text conversion.

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
// Override in a subclass to provide text representation
getTextValueAt(rowIndex: number, columnIndex: number): string {
  const value = this.getValueAt(rowIndex, columnIndex);
  
  // Handle different data types appropriately
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
```

#### Overrides

[AreaModel](AreaModel.md).[getTextValueAt](AreaModel.md#gettextvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:211](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L211)

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

#### Inherited from

[AreaModel](AreaModel.md).[getTooltipAt](AreaModel.md#gettooltipat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:450](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L450)

___

### getValueAt

▸ **getValueAt**(`rowIndex`, `columnIndex`): `any`

Returns the value of the cell at the specified row and column indices.
This is one of the most important methods in the area model, as it provides
the actual data to be displayed in each cell.
The base implementation returns undefined and should be overridden by
all subclasses.

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

#### Overrides

[AreaModel](AreaModel.md).[getValueAt](AreaModel.md#getvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L196)

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

#### Inherited from

[AreaModel](AreaModel.md).[getYPosByRowIndex](AreaModel.md#getyposbyrowindex)

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

#### Inherited from

[AreaModel](AreaModel.md).[init](AreaModel.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:590](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L590)

___

### invalidateDerivedValues

▸ **invalidateDerivedValues**(): `void`

Drops the cached results – the next cell read computes them again ([AreaModelIf.invalidateDerivedValues](../interfaces/AreaModelIf.md#invalidatederivedvalues)).
The table calls it when it filters, sorts, edits, gets `updateCells()` and on `tableApi.repaint()` / `repaintHard()`.

#### Returns

`void`

**`Example`**

```ts
order.total = 99;                                 // changed outside the table
tableApi.repaint();                               // the cells and the footer show it
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L158)

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

#### Inherited from

[AreaModel](AreaModel.md).[isEditable](AreaModel.md#iseditable)

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

#### Inherited from

[AreaModel](AreaModel.md).[isFilterable](AreaModel.md#isfilterable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:636](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L636)

___

### isLabelCell

▸ **isLabelCell**(`rowIndex`, `columnIndex`): `boolean`

Whether a cell shows the label of its footer row (the table gives it `role="rowheader"`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | footer row |
| `columnIndex` | `number` | column (model index) |

#### Returns

`boolean`

true for the label cell

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L192)

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

#### Inherited from

[AreaModel](AreaModel.md).[isRowCheckable](AreaModel.md#isrowcheckable)

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

#### Inherited from

[AreaModel](AreaModel.md).[isRowChecked](AreaModel.md#isrowchecked)

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

#### Inherited from

[AreaModel](AreaModel.md).[isSelectable](AreaModel.md#isselectable)

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

#### Inherited from

[AreaModel](AreaModel.md).[setRowChecked](AreaModel.md#setrowchecked)

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

#### Inherited from

[AreaModel](AreaModel.md).[setValue](AreaModel.md#setvalue)

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

#### Inherited from

[AreaModel](AreaModel.md).[sort](AreaModel.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model.ts#L164)

___

### toOptions

▸ **toOptions**\<`T`\>(`config`): [`AggregateFooterOptionsIf`](../interfaces/AggregateFooterOptionsIf.md)\<`T`\>

The full options of a short configuration.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`AggregateFooterConfig`](../modules.md#aggregatefooterconfig)\<`T`\> |

#### Returns

[`AggregateFooterOptionsIf`](../interfaces/AggregateFooterOptionsIf.md)\<`T`\>

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-aggregate-footer.ts#L127)
