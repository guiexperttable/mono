[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelSheet

# Class: AreaModelSheet

The body of a spreadsheet ([SpreadsheetFactory](SpreadsheetFactory.md)): **sparse** – only rows with content exist (a sheet with a
million empty rows costs nothing), row `n` = physical row `n` (cell formulas), sorting and filtering as a
permutation (display → physical) only while they apply. Cells are stored by data column (`A` = 0); the model columns
in front (row numbers) are left out with `columnOffset`.

**`Example`**

```ts
const body = new AreaModelSheet("body", [["Laptop", 1299], ["Mouse", 25]], 100, 26, 30, columnDefs, 1);
body.getSheetData();   // [["Laptop", 1299], ["Mouse", 25]]
```

**`Since`**

1.1.99

## Hierarchy

- [`AbstractAreaModel`](AbstractAreaModel.md)\<`unknown`[]\>

  ↳ **`AreaModelSheet`**

## Table of contents

### Constructors

- [constructor](AreaModelSheet.md#constructor)

### Properties

- [areaIdent](AreaModelSheet.md#areaident)
- [cellRenderers](AreaModelSheet.md#cellrenderers)
- [columnDefs](AreaModelSheet.md#columndefs)
- [columnOffset](AreaModelSheet.md#columnoffset)
- [defaultEditable](AreaModelSheet.md#defaulteditable)
- [defaultRowHeight](AreaModelSheet.md#defaultrowheight)
- [rowSelectionModel](AreaModelSheet.md#rowselectionmodel)
- [version](AreaModelSheet.md#version)
- [yPositions](AreaModelSheet.md#ypositions)

### Methods

- [addCalculatedClasses](AreaModelSheet.md#addcalculatedclasses)
- [arrayMove](AreaModelSheet.md#arraymove)
- [changeColumnOrder](AreaModelSheet.md#changecolumnorder)
- [deleteColumns](AreaModelSheet.md#deletecolumns)
- [deleteRows](AreaModelSheet.md#deleterows)
- [doSort](AreaModelSheet.md#dosort)
- [externalFilterChanged](AreaModelSheet.md#externalfilterchanged)
- [forEachCell](AreaModelSheet.md#foreachcell)
- [getAggregationSourceForValues](AreaModelSheet.md#getaggregationsourceforvalues)
- [getCalculatedRenderer](AreaModelSheet.md#getcalculatedrenderer)
- [getCalculatedText](AreaModelSheet.md#getcalculatedtext)
- [getCell](AreaModelSheet.md#getcell)
- [getCellRenderer](AreaModelSheet.md#getcellrenderer)
- [getColspanAt](AreaModelSheet.md#getcolspanat)
- [getConstantRowHeight](AreaModelSheet.md#getconstantrowheight)
- [getContentExtent](AreaModelSheet.md#getcontentextent)
- [getCustomClassesAt](AreaModelSheet.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelSheet.md#getcustomstyleat)
- [getDisplayRowIndex](AreaModelSheet.md#getdisplayrowindex)
- [getInputValueAt](AreaModelSheet.md#getinputvalueat)
- [getMaxColspan](AreaModelSheet.md#getmaxcolspan)
- [getMaxRowspan](AreaModelSheet.md#getmaxrowspan)
- [getPhysicalRowIndex](AreaModelSheet.md#getphysicalrowindex)
- [getPhysicalRowOfArray](AreaModelSheet.md#getphysicalrowofarray)
- [getRowArray](AreaModelSheet.md#getrowarray)
- [getRowByIndex](AreaModelSheet.md#getrowbyindex)
- [getRowCount](AreaModelSheet.md#getrowcount)
- [getRowHeight](AreaModelSheet.md#getrowheight)
- [getRowValue](AreaModelSheet.md#getrowvalue)
- [getRowspanAt](AreaModelSheet.md#getrowspanat)
- [getSheetColumnCount](AreaModelSheet.md#getsheetcolumncount)
- [getSheetData](AreaModelSheet.md#getsheetdata)
- [getTextValueAt](AreaModelSheet.md#gettextvalueat)
- [getTooltipAt](AreaModelSheet.md#gettooltipat)
- [getUnfilteredRowCount](AreaModelSheet.md#getunfilteredrowcount)
- [getValueAt](AreaModelSheet.md#getvalueat)
- [getYPosByRowIndex](AreaModelSheet.md#getyposbyrowindex)
- [hasDerivedColumns](AreaModelSheet.md#hasderivedcolumns)
- [init](AreaModelSheet.md#init)
- [insertColumns](AreaModelSheet.md#insertcolumns)
- [insertRows](AreaModelSheet.md#insertrows)
- [invalidateColumnValues](AreaModelSheet.md#invalidatecolumnvalues)
- [isCalculatedProperty](AreaModelSheet.md#iscalculatedproperty)
- [isDerivedProperty](AreaModelSheet.md#isderivedproperty)
- [isEditable](AreaModelSheet.md#iseditable)
- [isFilterable](AreaModelSheet.md#isfilterable)
- [isRowCheckable](AreaModelSheet.md#isrowcheckable)
- [isRowChecked](AreaModelSheet.md#isrowchecked)
- [isSelectable](AreaModelSheet.md#isselectable)
- [readPropertyPath](AreaModelSheet.md#readpropertypath)
- [restoreColumns](AreaModelSheet.md#restorecolumns)
- [restoreRows](AreaModelSheet.md#restorerows)
- [setCalculatedValue](AreaModelSheet.md#setcalculatedvalue)
- [setCell](AreaModelSheet.md#setcell)
- [setColumnDefs](AreaModelSheet.md#setcolumndefs)
- [setPropertyValue](AreaModelSheet.md#setpropertyvalue)
- [setRowChecked](AreaModelSheet.md#setrowchecked)
- [setSheetData](AreaModelSheet.md#setsheetdata)
- [setValue](AreaModelSheet.md#setvalue)
- [sort](AreaModelSheet.md#sort)

## Constructors

### constructor

• **new AreaModelSheet**(`areaIdent`, `data`, `rowCount`, `columnCount`, `defaultRowHeight`, `columnDefs?`, `columnOffset?`): [`AreaModelSheet`](AreaModelSheet.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` |
| `data` | `unknown`[][] | `undefined` |
| `rowCount` | `number` | `undefined` |
| `columnCount` | `number` | `undefined` |
| `defaultRowHeight` | `number` | `undefined` |
| `columnDefs` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] | `[]` |
| `columnOffset` | `number` | `0` |

#### Returns

[`AreaModelSheet`](AreaModelSheet.md)

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[constructor](AbstractAreaModel.md#constructor)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L31)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[areaIdent](AbstractAreaModel.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L31)

___

### cellRenderers

• `Protected` **cellRenderers**: (`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md))[]

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[cellRenderers](AbstractAreaModel.md#cellrenderers)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L25)

___

### columnDefs

• `Protected` **columnDefs**: [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] = `[]`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[columnDefs](AbstractAreaModel.md#columndefs)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L32)

___

### columnOffset

• `Readonly` **columnOffset**: `number` = `0`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L38)

___

### defaultEditable

• **defaultEditable**: `boolean` = `false`

Columns without an own `editable` are editable (Excel-style editing, `EditingOptionsIf.defaultEditable`; set by
the table). Row number, checkbox and group columns stay read only.

**`Since`**

1.1.99

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[defaultEditable](AbstractAreaModel.md#defaulteditable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L150)

___

### defaultRowHeight

• **defaultRowHeight**: `number` = `-1`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[defaultRowHeight](AbstractAreaModel.md#defaultrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L33)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[rowSelectionModel](AbstractAreaModel.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L22)

___

### version

• **version**: `number` = `0`

Increases with every structural change (rows/columns inserted or deleted, data replaced).

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L25)

___

### yPositions

• `Protected` **yPositions**: `number`[] = `[]`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[yPositions](AbstractAreaModel.md#ypositions)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L26)

## Methods

### addCalculatedClasses

▸ **addCalculatedClasses**(`classes`, `property`, `value`): `string`[]

The CSS class and tooltip of an error value of a formula.

#### Parameters

| Name | Type |
| :------ | :------ |
| `classes` | `string`[] |
| `property` | `undefined` \| `string` |
| `value` | () => `unknown` |

#### Returns

`string`[]

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[addCalculatedClasses](AbstractAreaModel.md#addcalculatedclasses)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:356](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L356)

___

### arrayMove

▸ **arrayMove**(`arr`, `fromIndex`, `toIndex`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `arr` | `any`[] |
| `fromIndex` | `number` |
| `toIndex` | `number` |

#### Returns

`any`[]

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[arrayMove](AbstractAreaModel.md#arraymove)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:208](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L208)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[changeColumnOrder](AbstractAreaModel.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:188](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L188)

___

### deleteColumns

▸ **deleteColumns**(`at`, `count`): [`unknown`[], `unknown`[]][]

Deletes data columns.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `number` | first data column |
| `count` | `number` | columns |

#### Returns

[`unknown`[], `unknown`[]][]

per row with content in the columns: the row array and its removed cells

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:345](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L345)

___

### deleteRows

▸ **deleteRows**(`at`, `count`): [`number`, `unknown`[]][]

Deletes rows (sorting and filters end).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `number` | first physical row |
| `count` | `number` | rows |

#### Returns

[`number`, `unknown`[]][]

the deleted rows with content (offset from `at`, the row array) – for undo

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:294](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L294)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the shown rows by the values of columns (empty cells last).

#### Parameters

| Name | Type |
| :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] |

#### Returns

`boolean`

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[doSort](AbstractAreaModel.md#dosort)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:245](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L245)

___

### externalFilterChanged

▸ **externalFilterChanged**(`predictFn`): `void`

A filter: the predicate gets the row as array of inputs (`[]` for an empty row).

#### Parameters

| Name | Type |
| :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`any`\> |

#### Returns

`void`

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[externalFilterChanged](AbstractAreaModel.md#externalfilterchanged)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:235](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L235)

___

### forEachCell

▸ **forEachCell**(`fn`): `void`

Calls `fn` for every stored cell (the sparse rows only).

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`row`: `number`, `col`: `number`, `value`: `unknown`) => `void` |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L124)

___

### getAggregationSourceForValues

▸ **getAggregationSourceForValues**(): `Object`

The rows of column aggregates in formulas (`SUM([total])`): the filtered row objects.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `length` | `number` |
| `rows` | () => `ArrayLike`\<`unknown`\> |
| `signal` | `unknown` |

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getAggregationSourceForValues](AbstractAreaModel.md#getaggregationsourceforvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:319](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L319)

___

### getCalculatedRenderer

▸ **getCalculatedRenderer**(`property`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

The renderer of a „Show values as“ column without an own renderer: the text of `getTextValueAt`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `undefined` \| `string` |

#### Returns

`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getCalculatedRenderer](AbstractAreaModel.md#getcalculatedrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:348](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L348)

___

### getCalculatedText

▸ **getCalculatedText**(`property`, `value`): `undefined` \| `string`

The text of a cell of a calculated / „Show values as“ column; `undefined` for a normal column.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `undefined` \| `string` |
| `value` | `unknown` |

#### Returns

`undefined` \| `string`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getCalculatedText](AbstractAreaModel.md#getcalculatedtext)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L336)

___

### getCell

▸ **getCell**(`row`, `col`): `unknown`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `number` |
| `col` | `number` |

#### Returns

`unknown`

the input of a cell by physical row and data column (`undefined` if empty)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L96)

___

### getCellRenderer

▸ **getCellRenderer**(`_rowIndex`, `columnIndex`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

Returns a cell renderer for the cell at the specified row and column indices.
A cell renderer is responsible for rendering the cell content in a custom way.
If undefined is returned, the cell value will be rendered directly.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getCellRenderer](AbstractAreaModel.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L58)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getColspanAt](AbstractAreaModel.md#getcolspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L65)

___

### getConstantRowHeight

▸ **getConstantRowHeight**(): `undefined` \| `number`

#### Returns

`undefined` \| `number`

the constant row height

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L230)

___

### getContentExtent

▸ **getContentExtent**(): [`number`, `number`]

The extent of the content in the current view: the last display row and model column with a value (the Excel
export leaves out the empty rest). `[-1, -1]` for an empty sheet.

#### Returns

[`number`, `number`]

last display row and last model column

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:376](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L376)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getCustomClassesAt](AbstractAreaModel.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L69)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getCustomStyleAt](AbstractAreaModel.md#getcustomstyleat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L76)

___

### getDisplayRowIndex

▸ **getDisplayRowIndex**(`physicalRow`): `number`

The display row of a physical row, `-1` if a filter hides it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `physicalRow` | `number` | the physical row |

#### Returns

`number`

the display index

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:175](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L175)

___

### getInputValueAt

▸ **getInputValueAt**(`rowIndex`, `columnIndex`): `unknown`

The input of a cell – the formula text of a formula, otherwise the value (`""` for an empty cell).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |
| `columnIndex` | `number` | model column |

#### Returns

`unknown`

the input

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:199](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L199)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getMaxColspan](AbstractAreaModel.md#getmaxcolspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L104)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getMaxRowspan](AbstractAreaModel.md#getmaxrowspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L108)

___

### getPhysicalRowIndex

▸ **getPhysicalRowIndex**(`rowIndex`): `number`

The physical row (= row number − 1) of a display row – row numbers in `"original"` mode and cell formulas use it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |

#### Returns

`number`

the physical row

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L165)

___

### getPhysicalRowOfArray

▸ **getPhysicalRowOfArray**(`row`): `undefined` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `unknown` |

#### Returns

`undefined` \| `number`

the physical row of a row array of this model

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L129)

___

### getRowArray

▸ **getRowArray**(`row`): `undefined` \| `unknown`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `number` |

#### Returns

`undefined` \| `unknown`[]

the row array of a physical row (`undefined` for an empty row)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L119)

___

### getRowByIndex

▸ **getRowByIndex**(`rowIndex`): `any`

The row array of a display row – `undefined` for an empty row (no object is created by reading).

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`any`

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowByIndex](AbstractAreaModel.md#getrowbyindex)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:221](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L221)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowCount](AbstractAreaModel.md#getrowcount)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L150)

___

### getRowHeight

▸ **getRowHeight**(`_rowIndex`): `number`

Returns the height of the row at the specified index, in pixels.
This method allows for variable row heights in the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowHeight](AbstractAreaModel.md#getrowheight)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:225](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L225)

___

### getRowValue

▸ **getRowValue**(`row`, `property`): `unknown`

The value of a column for a row object – the computed value of a calculated column, otherwise the property
(path). A `TreeRow` is unwrapped. The table API offers it as [TableApi.getRowValue](TableApi.md#getrowvalue).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `any` | a row object (or `TreeRow`) |
| `property` | `string` | the property of the column |

#### Returns

`unknown`

the value

**`Example`**

```ts
const body = tableModel.getBodyModel() as AreaModelObjectArray<Item>;
body.getRowValue({ price: 25, quantity: 10 }, "total");   // 250
```

**`Since`**

1.1.95

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getRowValue](AbstractAreaModel.md#getrowvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:255](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L255)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getRowspanAt](AbstractAreaModel.md#getrowspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L80)

___

### getSheetColumnCount

▸ **getSheetColumnCount**(): `number`

#### Returns

`number`

the number of data columns

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L134)

___

### getSheetData

▸ **getSheetData**(): `unknown`[][]

The cells as rows × columns, up to the last row and column with content (empty cells `""`) – e.g. to save them.

#### Returns

`unknown`[][]

the data

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L75)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getTextValueAt](AbstractAreaModel.md#gettextvalueat)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:203](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L203)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getTooltipAt](AbstractAreaModel.md#gettooltipat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L48)

___

### getUnfilteredRowCount

▸ **getUnfilteredRowCount**(): `number`

#### Returns

`number`

all rows, without sorting and filters

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:155](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L155)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getValueAt](AbstractAreaModel.md#getvalueat)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L184)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[getYPosByRowIndex](AbstractAreaModel.md#getyposbyrowindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L113)

___

### hasDerivedColumns

▸ **hasDerivedColumns**(): `boolean`

True if the model has calculated or „Show values as“ columns – their cells depend on other cells
(the table redraws them after `updateCells`).

#### Returns

`boolean`

whether derived columns exist

**`Since`**

1.1.95

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[hasDerivedColumns](AbstractAreaModel.md#hasderivedcolumns)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:270](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L270)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[init](AbstractAreaModel.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L121)

___

### insertColumns

▸ **insertColumns**(`at`, `count`): `void`

Inserts empty data columns before a data column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `number` | data column |
| `count` | `number` | columns |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:330](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L330)

___

### insertRows

▸ **insertRows**(`at`, `count`): `void`

Inserts empty rows before a physical row (sorting and filters end).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `number` | physical row |
| `count` | `number` | rows |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:282](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L282)

___

### invalidateColumnValues

▸ **invalidateColumnValues**(): `void`

Drops the cached aggregates and the getter lookup of calculated columns.

#### Returns

`void`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[invalidateColumnValues](AbstractAreaModel.md#invalidatecolumnvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:303](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L303)

___

### isCalculatedProperty

▸ **isCalculatedProperty**(`property`): `boolean`

True if a column of this model with this property is calculated (`valueGetter` or `formula`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the property of the column |

#### Returns

`boolean`

whether its values are computed

**`Example`**

```ts
tableModel.getBodyModel().isCalculatedProperty?.("total");   // true
```

**`Since`**

1.1.95

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isCalculatedProperty](AbstractAreaModel.md#iscalculatedproperty)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:237](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L237)

___

### isDerivedProperty

▸ **isDerivedProperty**(`property`): `boolean`

True if the cells of a column depend on other cells (calculated or „Show values as“).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the property of the column |

#### Returns

`boolean`

whether the column is derived

**`Since`**

1.1.95

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isDerivedProperty](AbstractAreaModel.md#isderivedproperty)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:282](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L282)

___

### isEditable

▸ **isEditable**(`_rowIndex`, `columnIndex`): `boolean`

Determines whether the cell at the specified row and column indices is editable.
If true, the user can edit the cell content.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row |
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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isEditable](AbstractAreaModel.md#iseditable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L152)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isFilterable](AbstractAreaModel.md#isfilterable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L131)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isRowCheckable](AbstractAreaModel.md#isrowcheckable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L88)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isRowChecked](AbstractAreaModel.md#isrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L92)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[isSelectable](AbstractAreaModel.md#isselectable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L184)

___

### readPropertyPath

▸ **readPropertyPath**(`row`, `property`): `unknown`

The value of a property path – overridden by the models with their own path semantics.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `any` |
| `property` | `string` |

#### Returns

`unknown`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[readPropertyPath](AbstractAreaModel.md#readpropertypath)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:308](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L308)

___

### restoreColumns

▸ **restoreColumns**(`at`, `count`, `removed`): `void`

Inserts columns again that [deleteColumns](AreaModelSheet.md#deletecolumns) removed (undo).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `number` | first data column |
| `count` | `number` | columns |
| `removed` | readonly readonly [`unknown`[], `unknown`[]][] | what `deleteColumns` returned |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:363](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L363)

___

### restoreRows

▸ **restoreRows**(`at`, `count`, `removed`): `void`

Inserts rows again that [deleteRows](AreaModelSheet.md#deleterows) removed (undo): the same row arrays at their places.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `number` | first physical row |
| `count` | `number` | rows |
| `removed` | readonly readonly [`number`, `unknown`[]][] | what `deleteRows` returned |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:316](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L316)

___

### setCalculatedValue

▸ **setCalculatedValue**(`row`, `columnDef`, `value`): `boolean`

Writes an edited value of a calculated column through its `valueSetter`; without one: rejected.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `any` |
| `columnDef` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |
| `value` | `any` |

#### Returns

`boolean`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[setCalculatedValue](AbstractAreaModel.md#setcalculatedvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:325](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L325)

___

### setCell

▸ **setCell**(`row`, `col`, `value`): `void`

Writes the input of a cell by physical row and data column (the row is created on demand).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row |
| `col` | `number` | data column |
| `value` | `unknown` | the input |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L107)

___

### setColumnDefs

▸ **setColumnDefs**(`columnDefs`): `void`

New column definitions (inserted or deleted columns).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnDefs` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] | all columns of the table |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L143)

___

### setPropertyValue

▸ **setPropertyValue**(`o`, `props`, `value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `o` | `any` |
| `props` | `string`[] |
| `value` | `any` |

#### Returns

`boolean`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[setPropertyValue](AbstractAreaModel.md#setpropertyvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:193](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L193)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[setRowChecked](AbstractAreaModel.md#setrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L97)

___

### setSheetData

▸ **setSheetData**(`data`, `rowCount?`, `columnCount?`): `void`

Replaces all cells (sorting and filters end).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `unknown`[][] | rows × data columns |
| `rowCount?` | `number` | at least the rows of `data` |
| `columnCount?` | `number` | at least the longest row |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L53)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[setValue](AbstractAreaModel.md#setvalue)

#### Defined in

[src/lib/table/spreadsheet/area-model-sheet.ts:208](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/area-model-sheet.ts#L208)

___

### sort

▸ **sort**(`_compareFn?`): `void`

Sorts the rows in this area using a custom comparator function.
This method provides more flexibility than doSort for complex sorting logic.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_compareFn?` | (`a`: `any`, `b`: `any`) => `number` | A function that compares two rows and returns a number: - Negative if a should come before b - Positive if a should come after b - Zero if they are equivalent for sorting purposes |

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[sort](AbstractAreaModel.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L140)
