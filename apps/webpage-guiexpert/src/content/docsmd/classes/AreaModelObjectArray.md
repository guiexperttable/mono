[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelObjectArray

# Class: AreaModelObjectArray\<T\>

**`Description`**

The `AreaModelObjectArray` class is a fundamental component of the GuiExpert Table library that 
represents a data model for a specific area of a table (header, body, or footer) where the data 
is stored as an array of objects.

This class extends [AbstractAreaModel](AbstractAreaModel.md) and implements [ObjectArrayHolderIf](../interfaces/ObjectArrayHolderIf.md), providing 
a robust implementation for handling tabular data where each row is represented as an object in an array.

The class provides functionality for:
- Managing row data (setting, filtering, sorting)
- Retrieving values from specific cells
- Handling row selection and focus
- Supporting custom sorting and filtering
- Accessing nested properties within objects
- Managing column order changes
- Applying custom CSS classes to rows

**`Example`**

```ts
// Basic usage with an array of simple objects
const rows = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
  { id: 3, name: 'Bob', age: 40 }
];

const columnDefs: ColumnDefIf[] = [
  new ColumnDef('id', 'ID', new Size(50, 'px')),
  new ColumnDef('name', 'Name', new Size(150, 'px')),
  new ColumnDef('age', 'Age', new Size(100, 'px'))
];

const bodyAreaModel = new AreaModelObjectArray<any>(
  'body',
  rows,
  30, // default row height
  columnDefs
);
```

**`Example`**

```ts
// Using with TableFactory to create a complete table model
import { TableFactory } from '../../../factory/table-factory';

const rows = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
  { id: 3, name: 'Bob', age: 40 }
];

const columnDefs: ColumnDefIf[] = [
  new ColumnDef('id', 'ID', new Size(50, 'px')),
  new ColumnDef('name', 'Name', new Size(150, 'px')),
  new ColumnDef('age', 'Age', new Size(100, 'px'))
];

const tableModel = TableFactory.createByObjectArray(
  rows,
  [['ID', 'Name', 'Age']], // header
  [], // footer
  0, // fixedLeftColumnCount
  0, // fixedRightColumnCount
  false, // rowCheckboxVisible
  undefined, // defaultRowHeights
  columnDefs
);
```

**`Example`**

```ts
// Working with nested properties
const rows = [
  { id: 1, person: { name: 'John', contact: { email: 'john@example.com', phone: '123-456-7890' } } },
  { id: 2, person: { name: 'Jane', contact: { email: 'jane@example.com', phone: '098-765-4321' } } }
];

const columnDefs: ColumnDefIf[] = [
  new ColumnDef('id', 'ID', new Size(50, 'px')),
  new ColumnDef('person.name', 'Name', new Size(150, 'px')),
  new ColumnDef('person.contact.email', 'Email', new Size(200, 'px')),
  new ColumnDef('person.contact.phone', 'Phone', new Size(150, 'px'))
];

const bodyAreaModel = new AreaModelObjectArray<any>(
  'body',
  rows,
  30, // default row height
  columnDefs
);
```

**`Example`**

```ts
// Filtering rows
const bodyAreaModel = new AreaModelObjectArray<any>('body', rows, 30, columnDefs);

// Filter rows where age > 30
bodyAreaModel.externalFilterChanged(row => row.age > 30);

// Get the filtered rows
const filteredRows = bodyAreaModel.getFilteredRows();
```

**`Example`**

```ts
// Sorting rows
const bodyAreaModel = new AreaModelObjectArray<any>('body', rows, 30, columnDefs);

// Sort by age in ascending order
bodyAreaModel.doSort([{ columnIndex: 2, sortState: 'asc' }]);

// Sort by name in descending order
bodyAreaModel.doSort([{ columnIndex: 1, sortState: 'desc' }]);
```

**`Example`**

```ts
// Custom sorting with a comparator function
const bodyAreaModel = new AreaModelObjectArray<any>('body', rows, 30, columnDefs);

// Sort by name length
bodyAreaModel.sort((a, b) => a.name.length - b.name.length);
```

**`Example`**

```ts
// Working with row selection and focus
const bodyAreaModel = new AreaModelObjectArray<any>('body', rows, 30, columnDefs);

// Set focus on the second row
bodyAreaModel.setFocusedRowIndex(1);

// Get the focused row index
const focusedRowIndex = bodyAreaModel.getFocusedRowIndex();

// Get custom classes for a cell (includes selection and focus classes)
const classes = bodyAreaModel.getCustomClassesAt(1, 0);
```

**`See`**

 - [AbstractAreaModel](AbstractAreaModel.md) - The parent class that provides the base implementation
 - [ObjectArrayHolderIf](../interfaces/ObjectArrayHolderIf.md) - The interface that defines methods for accessing rows
 - [AreaModelObjectArrayWithColumndefs](AreaModelObjectArrayWithColumndefs.md) - A subclass that changes the constructor parameter order

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of objects in the array. Each object represents a row in the table. |

## Hierarchy

- [`AbstractAreaModel`](AbstractAreaModel.md)\<`T`\>

  ↳ **`AreaModelObjectArray`**

  ↳↳ [`AreaModelObjectArrayWithColumndefs`](AreaModelObjectArrayWithColumndefs.md)

## Implements

- [`ObjectArrayHolderIf`](../interfaces/ObjectArrayHolderIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](AreaModelObjectArray.md#constructor)

### Properties

- [\_focusedRowIndex](AreaModelObjectArray.md#_focusedrowindex)
- [areaIdent](AreaModelObjectArray.md#areaident)
- [cellRenderers](AreaModelObjectArray.md#cellrenderers)
- [columnDefs](AreaModelObjectArray.md#columndefs)
- [defaultRowHeight](AreaModelObjectArray.md#defaultrowheight)
- [filteredRows](AreaModelObjectArray.md#filteredrows)
- [focusedRowClass](AreaModelObjectArray.md#focusedrowclass)
- [properties](AreaModelObjectArray.md#properties)
- [rowSelectionModel](AreaModelObjectArray.md#rowselectionmodel)
- [rows](AreaModelObjectArray.md#rows)
- [selectedRowClass](AreaModelObjectArray.md#selectedrowclass)
- [yPositions](AreaModelObjectArray.md#ypositions)

### Methods

- [addCalculatedClasses](AreaModelObjectArray.md#addcalculatedclasses)
- [applyShowValuesAs](AreaModelObjectArray.md#applyshowvaluesas)
- [arrayMove](AreaModelObjectArray.md#arraymove)
- [canMoveRows](AreaModelObjectArray.md#canmoverows)
- [changeColumnOrder](AreaModelObjectArray.md#changecolumnorder)
- [createSortValueReader](AreaModelObjectArray.md#createsortvaluereader)
- [doSort](AreaModelObjectArray.md#dosort)
- [externalFilterChanged](AreaModelObjectArray.md#externalfilterchanged)
- [filterRowsByPredict](AreaModelObjectArray.md#filterrowsbypredict)
- [findRowFromAllRowsByAllCriteria](AreaModelObjectArray.md#findrowfromallrowsbyallcriteria)
- [findRowFromFilteredRowsByAllCriteria](AreaModelObjectArray.md#findrowfromfilteredrowsbyallcriteria)
- [genericFlatTableSortComparator](AreaModelObjectArray.md#genericflattablesortcomparator)
- [getAggregationSourceForValues](AreaModelObjectArray.md#getaggregationsourceforvalues)
- [getAllRows](AreaModelObjectArray.md#getallrows)
- [getCalculatedRenderer](AreaModelObjectArray.md#getcalculatedrenderer)
- [getCalculatedText](AreaModelObjectArray.md#getcalculatedtext)
- [getCellRenderer](AreaModelObjectArray.md#getcellrenderer)
- [getColspanAt](AreaModelObjectArray.md#getcolspanat)
- [getConstantRowHeight](AreaModelObjectArray.md#getconstantrowheight)
- [getCustomClassesAt](AreaModelObjectArray.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelObjectArray.md#getcustomstyleat)
- [getFilteredRows](AreaModelObjectArray.md#getfilteredrows)
- [getFocusedRowIndex](AreaModelObjectArray.md#getfocusedrowindex)
- [getMaxColspan](AreaModelObjectArray.md#getmaxcolspan)
- [getMaxRowspan](AreaModelObjectArray.md#getmaxrowspan)
- [getRowByIndex](AreaModelObjectArray.md#getrowbyindex)
- [getRowCount](AreaModelObjectArray.md#getrowcount)
- [getRowHeight](AreaModelObjectArray.md#getrowheight)
- [getRowValue](AreaModelObjectArray.md#getrowvalue)
- [getRowspanAt](AreaModelObjectArray.md#getrowspanat)
- [getTextValueAt](AreaModelObjectArray.md#gettextvalueat)
- [getTooltipAt](AreaModelObjectArray.md#gettooltipat)
- [getUnfilteredRowCount](AreaModelObjectArray.md#getunfilteredrowcount)
- [getValueAt](AreaModelObjectArray.md#getvalueat)
- [getValueByT](AreaModelObjectArray.md#getvaluebyt)
- [getYPosByRowIndex](AreaModelObjectArray.md#getyposbyrowindex)
- [hasDerivedColumns](AreaModelObjectArray.md#hasderivedcolumns)
- [init](AreaModelObjectArray.md#init)
- [invalidateColumnValues](AreaModelObjectArray.md#invalidatecolumnvalues)
- [invalidateDerivedValues](AreaModelObjectArray.md#invalidatederivedvalues)
- [isCalculatedProperty](AreaModelObjectArray.md#iscalculatedproperty)
- [isDerivedProperty](AreaModelObjectArray.md#isderivedproperty)
- [isEditable](AreaModelObjectArray.md#iseditable)
- [isFilterable](AreaModelObjectArray.md#isfilterable)
- [isRowCheckable](AreaModelObjectArray.md#isrowcheckable)
- [isRowChecked](AreaModelObjectArray.md#isrowchecked)
- [isSelectable](AreaModelObjectArray.md#isselectable)
- [moveRows](AreaModelObjectArray.md#moverows)
- [readPropertyPath](AreaModelObjectArray.md#readpropertypath)
- [setCalculatedValue](AreaModelObjectArray.md#setcalculatedvalue)
- [setFocusedRowIndex](AreaModelObjectArray.md#setfocusedrowindex)
- [setPropertyValue](AreaModelObjectArray.md#setpropertyvalue)
- [setRowChecked](AreaModelObjectArray.md#setrowchecked)
- [setRows](AreaModelObjectArray.md#setrows)
- [setValue](AreaModelObjectArray.md#setvalue)
- [sort](AreaModelObjectArray.md#sort)

## Constructors

### constructor

• **new AreaModelObjectArray**\<`T`\>(`areaIdent`, `rows`, `defaultRowHeight`, `columnDefs?`, `selectedRowClass?`, `focusedRowClass?`): [`AreaModelObjectArray`](AreaModelObjectArray.md)\<`T`\>

Creates an instance of AreaModelObjectArray.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` | Identifies which area of the table this model represents ('header', 'body', or 'footer') |
| `rows` | `T`[] | `undefined` | The array of objects that represent the rows in this area |
| `defaultRowHeight` | `number` | `undefined` | The default height for rows in this area (in pixels) |
| `columnDefs?` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] | `[]` | Definitions for the columns in this area |
| `selectedRowClass?` | `string` | `'ge-selected-row'` | CSS class to apply to selected rows |
| `focusedRowClass?` | `string` | `'ge-focused-row'` | CSS class to apply to the focused row |

#### Returns

[`AreaModelObjectArray`](AreaModelObjectArray.md)\<`T`\>

**`Example`**

```ts
const rows = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 }
];

const columnDefs: ColumnDefIf[] = [
  new ColumnDef('id', 'ID', new Size(50, 'px')),
  new ColumnDef('name', 'Name', new Size(150, 'px')),
  new ColumnDef('age', 'Age', new Size(100, 'px'))
];

const bodyAreaModel = new AreaModelObjectArray(
  'body',
  rows,
  30,
  columnDefs
);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[constructor](AbstractAreaModel.md#constructor)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:216](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L216)

## Properties

### \_focusedRowIndex

• **\_focusedRowIndex**: `number` = `0`

The index of the currently focused row.
This is used to apply the focused row styling.

**`Default`**

```ts
0
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:236](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L236)

___

### areaIdent

• **areaIdent**: [`AreaIdent`](../modules.md#areaident)

Identifies which area of the table this model represents ('header', 'body', or 'footer')

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[areaIdent](AbstractAreaModel.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:217](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L217)

___

### cellRenderers

• `Protected` **cellRenderers**: (`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md))[]

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[cellRenderers](AbstractAreaModel.md#cellrenderers)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L23)

___

### columnDefs

• `Protected` **columnDefs**: [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] = `[]`

Definitions for the columns in this area

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[columnDefs](AbstractAreaModel.md#columndefs)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:220](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L220)

___

### defaultRowHeight

• **defaultRowHeight**: `number`

The default height for rows in this area (in pixels)

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[defaultRowHeight](AbstractAreaModel.md#defaultrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L219)

___

### filteredRows

• `Protected` **filteredRows**: `T`[]

A copy of the rows array that can be filtered and sorted without affecting the original data.
This array is used for rendering the table and is updated when filtering or sorting is applied.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:174](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L174)

___

### focusedRowClass

• **focusedRowClass**: `string` = `'ge-focused-row'`

CSS class to apply to the focused row

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L222)

___

### properties

• `Protected` `Readonly` **properties**: `string`[]

An array of property names extracted from the column definitions.
These properties are used to access values from the row objects.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:166](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L166)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L20)

___

### rows

• `Protected` **rows**: `T`[]

The array of objects that represent the rows in this area

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:218](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L218)

___

### selectedRowClass

• **selectedRowClass**: `string` = `'ge-selected-row'`

CSS class to apply to selected rows

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:221](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L221)

___

### yPositions

• `Protected` **yPositions**: `number`[] = `[]`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[yPositions](AbstractAreaModel.md#ypositions)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L24)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:328](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L328)

___

### applyShowValuesAs

▸ **applyShowValuesAs**(`rowIndex`, `property`, `value`, `options`): `unknown`

„Show values as“ of one cell; the reference are the filtered rows in display order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `property` | `string` |
| `value` | `unknown` |
| `options` | [`ShowValuesAsIf`](../interfaces/ShowValuesAsIf.md) |

#### Returns

`unknown`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:448](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L448)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:186](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L186)

___

### canMoveRows

▸ **canMoveRows**(`rowIndices`, `target`): `boolean`

Row drag: true if the rows can be moved – no filter hides a row and the target is a row of this model
(`"before"` / `"after"`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndices` | `number`[] | display indices of the dragged rows |
| `target` | [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) | the drop target |

#### Returns

`boolean`

true if [moveRows](AreaModelObjectArray.md#moverows) would move them

**`Example`**

```ts
bodyAreaModel.canMoveRows([2], { rowIndex: 6, position: "after" });   // true without a filter
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:343](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L343)

___

### changeColumnOrder

▸ **changeColumnOrder**(`sourceColumnIndex`, `targetColumnIndex`): `void`

Changes the order of columns by moving a column from one position to another.
This method updates both the properties array and calls the parent class implementation.

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
bodyAreaModel.changeColumnOrder(1, 3);
```

**`Example`**

```ts
// Move the last column to the first position
const lastIndex = tableModel.getColumnCount() - 1;
bodyAreaModel.changeColumnOrder(lastIndex, 0);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[changeColumnOrder](AbstractAreaModel.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:785](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L785)

___

### createSortValueReader

▸ **createSortValueReader**(`property`): (`row`: `T`) => `unknown`

The value of a row for a sort pass: a calculated column is computed once per row (memo for this pass, not
2·n·log n times); formula errors sort last (as `undefined`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |

#### Returns

`fn`

▸ (`row`): `unknown`

The value of a row for a sort pass: a calculated column is computed once per row (memo for this pass, not
2·n·log n times); formula errors sort last (as `undefined`).

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

##### Returns

`unknown`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:865](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L865)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the filtered rows based on the provided sort items.
This method supports sorting by multiple columns with different sort directions: the first item is the primary
key, the following ones break ties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | An array of sort items, each containing a column index and sort state |

#### Returns

`boolean`

Always returns true to indicate sorting was performed

**`Example`**

```ts
// Sort by age in ascending order
bodyAreaModel.doSort([{ columnIndex: 2, sortState: 'asc' }]);
```

**`Example`**

```ts
// Sort by name in descending order, then by age in ascending order
bodyAreaModel.doSort([
  { columnIndex: 1, sortState: 'desc' },
  { columnIndex: 2, sortState: 'asc' }
]);
```

**`Example`**

```ts
// Clear sorting
bodyAreaModel.doSort([new SortItem(0, '')]);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[doSort](AbstractAreaModel.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:688](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L688)

___

### externalFilterChanged

▸ **externalFilterChanged**(`predictFn`): `void`

Applies an external filter function to the rows array.
This method updates the filtered rows array without modifying the original rows array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`any`\> | A function that returns true for rows to keep and false for rows to filter out |

#### Returns

`void`

**`Example`**

```ts
// Filter rows where age is greater than 30
bodyAreaModel.externalFilterChanged(row => row.age > 30);
```

**`Example`**

```ts
// Filter rows based on a search term
const searchTerm = 'john';
bodyAreaModel.externalFilterChanged(row => 
  row.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**`Example`**

```ts
// Clear all filters
bodyAreaModel.externalFilterChanged(() => true);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[externalFilterChanged](AbstractAreaModel.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:660](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L660)

___

### filterRowsByPredict

▸ **filterRowsByPredict**(`predict`): `void`

Filters both the original rows and filtered rows arrays using the provided predicate function.
Unlike `externalFilterChanged`, this method permanently modifies the original rows array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predict` | (`row`: `T`) => `boolean` | A function that returns true for rows to keep and false for rows to filter out |

#### Returns

`void`

**`Example`**

```ts
// Remove all rows where age is less than 30
bodyAreaModel.filterRowsByPredict(row => row.age >= 30);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:295](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L295)

___

### findRowFromAllRowsByAllCriteria

▸ **findRowFromAllRowsByAllCriteria**(`criteria`, `predicate`): `undefined` \| `T`

Searches through all rows to find a row that matches the given criteria based on the predicate function.
This method searches within the original rows array, including rows that may have been filtered out.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `criteria` | `Partial`\<`T`\> | A partial object containing the search criteria |
| `predicate` | (`criteria`: `Partial`\<`T`\>, `row`: `T`) => `boolean` | A function that takes the search criteria and a row, and returns true if the row matches the criteria |

#### Returns

`undefined` \| `T`

The first matching row from all rows, or undefined if no match is found

**`Example`**

```ts
// Find a user by ID in all rows
const criteria = { id: 42 };
const user = bodyAreaModel.findRowFromAllRowsByAllCriteria(
  criteria,
  (criteria, row) => row.id === criteria.id
);
```

**`Example`**

```ts
// Find a user with a specific property value in all rows
const criteria = { department: 'Engineering', role: 'Manager' };
const user = bodyAreaModel.findRowFromAllRowsByAllCriteria(
  criteria,
  (criteria, row) => row.department === criteria.department && row.role === criteria.role
);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:583](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L583)

___

### findRowFromFilteredRowsByAllCriteria

▸ **findRowFromFilteredRowsByAllCriteria**(`criteria`, `predicate`): `undefined` \| `T`

Returns the first row from the filtered rows that matches the given criteria based on the provided predicate function.
This method only searches within the filtered rows, not the original rows array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `criteria` | `Partial`\<`T`\> | A partial object containing the search criteria |
| `predicate` | (`criteria`: `Partial`\<`T`\>, `row`: `T`) => `boolean` | A function that takes the search criteria and a row, and returns true if the row matches the criteria |

#### Returns

`undefined` \| `T`

The first matching row, or undefined if no match is found

**`Example`**

```ts
// Find a user by name in the filtered rows
const criteria = { name: 'John' };
const user = bodyAreaModel.findRowFromFilteredRowsByAllCriteria(
  criteria,
  (criteria, row) => row.name === criteria.name
);
```

**`Example`**

```ts
// Find a user by age range in the filtered rows
const criteria = { minAge: 25, maxAge: 35 };
const user = bodyAreaModel.findRowFromFilteredRowsByAllCriteria(
  criteria,
  (criteria, row) => row.age >= criteria.minAge && row.age <= criteria.maxAge
);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:552](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L552)

___

### genericFlatTableSortComparator

▸ **genericFlatTableSortComparator**(`property`, `f`): (`a`: `T`, `b`: `T`) => `number`

Creates a comparator function for sorting rows based on a property and sort direction.
This method supports custom sort comparators defined in column definitions.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property to sort by |
| `f` | `number` | The sort direction factor: 1 for ascending, -1 for descending, 0 for no sorting |

#### Returns

`fn`

A comparator function that compares two rows

▸ (`a`, `b`): `number`

Creates a comparator function for sorting rows based on a property and sort direction.
This method supports custom sort comparators defined in column definitions.

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `T` |
| `b` | `T` |

##### Returns

`number`

A comparator function that compares two rows

**`Example`**

```ts
// inside a subclass: a comparator for sorting by name in ascending order
const comparator = this.genericFlatTableSortComparator('name', 1);

// Sort the rows using the comparator
const sortedRows = [...this.getFilteredRows()].sort(comparator);
```

**`Example`**

```ts
// inside a subclass: a comparator for sorting by name in ascending order
const comparator = this.genericFlatTableSortComparator('name', 1);

// Sort the rows using the comparator
const sortedRows = [...this.getFilteredRows()].sort(comparator);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:838](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L838)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getAggregationSourceForValues](AbstractAreaModel.md#getaggregationsourceforvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:482](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L482)

___

### getAllRows

▸ **getAllRows**(): `T`[]

Returns the original, unfiltered array of rows.
This can be useful when you need to access all data regardless of any applied filters.

#### Returns

`T`[]

The original array of row objects

**`Example`**

```ts
// Get all rows, including those filtered out
const allRows = bodyAreaModel.getAllRows();

// Calculate average age across all rows
const totalAge = allRows.reduce((sum, row) => sum + row.age, 0);
const averageAge = totalAge / allRows.length;
```

#### Implementation of

[ObjectArrayHolderIf](../interfaces/ObjectArrayHolderIf.md).[getAllRows](../interfaces/ObjectArrayHolderIf.md#getallrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:523](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L523)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:320](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L320)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:308](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L308)

___

### getCellRenderer

▸ **getCellRenderer**(`rowIndex`, `columnIndex`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

A „Show values as“ column without an own body renderer shows the formatted text.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getCellRenderer](AbstractAreaModel.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:421](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L421)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L57)

___

### getConstantRowHeight

▸ **getConstantRowHeight**(): `undefined` \| `number`

All rows share `defaultRowHeight` – unless a subclass overrides `getRowHeight()`, then row heights may
vary and `undefined` is returned.

#### Returns

`undefined` \| `number`

The constant row height or `undefined`.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:611](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L611)

___

### getCustomClassesAt

▸ **getCustomClassesAt**(`rowIndex`, `_columnIndex`): `string`[]

Gets the custom CSS classes that should be applied to a cell.
This method extends the parent class implementation to add selection and focus classes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `_columnIndex` | `number` | The index of the column (unused in this implementation) |

#### Returns

`string`[]

An array of CSS class names to apply to the cell

**`Example`**

```ts
// Get the CSS classes for a cell
const classes = bodyAreaModel.getCustomClassesAt(1, 2);
console.log('CSS classes:', classes);
```

**`Example`**

```ts
// Apply the classes to a cell element
const cellElement = document.createElement('div');
const classes = bodyAreaModel.getCustomClassesAt(rowIndex, columnIndex);
cellElement.classList.add(...classes);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getCustomClassesAt](AbstractAreaModel.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:809](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L809)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L65)

___

### getFilteredRows

▸ **getFilteredRows**(): `T`[]

Retrieves the filtered and sorted rows from the dataset.
These rows are used for rendering the table.
Unlike `getAllRows()`, this method returns only the rows that match any applied filters.

#### Returns

`T`[]

An array containing the filtered (and sorted) rows

**`Example`**

```ts
// Get all filtered rows
const filteredRows = bodyAreaModel.getFilteredRows();

// Count rows that match a certain condition
const adultsCount = filteredRows.filter(row => row.age >= 18).length;
```

#### Implementation of

[ObjectArrayHolderIf](../interfaces/ObjectArrayHolderIf.md).[getFilteredRows](../interfaces/ObjectArrayHolderIf.md#getfilteredrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:505](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L505)

___

### getFocusedRowIndex

▸ **getFocusedRowIndex**(): `number`

Gets the index of the currently focused row.

#### Returns

`number`

The index of the focused row

**`Example`**

```ts
const focusedRowIndex = bodyAreaModel.getFocusedRowIndex();
console.log(`The focused row is at index ${focusedRowIndex}`);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:247](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L247)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L93)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L97)

___

### getRowByIndex

▸ **getRowByIndex**(`rowIndex`): `any`

Returns the row object at the specified index from the filtered rows array.
This method overrides the parent class implementation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to retrieve |

#### Returns

`any`

The row object at the specified index, or undefined if the index is out of bounds

**`Example`**

```ts
// Get the first row object
const row = bodyAreaModel.getRowByIndex(0);
console.log('First row:', row);
```

**`Example`**

```ts
// Iterate through all rows
for (let i = 0; i < bodyAreaModel.getRowCount(); i++) {
  const row = bodyAreaModel.getRowByIndex(i);
  console.log(`Row ${i}:`, row);
}
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowByIndex](AbstractAreaModel.md#getrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:635](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L635)

___

### getRowCount

▸ **getRowCount**(): `number`

Returns the number of rows in the filtered rows array.
This is used to determine how many rows should be rendered in the table.

#### Returns

`number`

The number of rows in the filtered rows array

**`Example`**

```ts
const rowCount = bodyAreaModel.getRowCount();
console.log(`The table has ${rowCount} rows`);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowCount](AbstractAreaModel.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:310](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L310)

___

### getRowHeight

▸ **getRowHeight**(`_rowIndex`): `number`

Returns the height of the row at the specified index.
This implementation always returns the default row height.
Override this method in subclasses to support variable row heights.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowIndex` | `number` | The index of the row (unused in this implementation) |

#### Returns

`number`

The height of the row in pixels

**`Example`**

```ts
const rowHeight = bodyAreaModel.getRowHeight(0);
console.log(`The first row has a height of ${rowHeight}px`);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowHeight](AbstractAreaModel.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:601](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L601)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:233](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L233)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L69)

___

### getTextValueAt

▸ **getTextValueAt**(`rowIndex`, `columnIndex`): `string`

The text of a cell: for a „Show values as“ column the formatted value (`"66.7%"`), for a formula error its code;
otherwise like before (`'' + value`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row |
| `columnIndex` | `number` | the column |

#### Returns

`string`

the text

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getTextValueAt](AbstractAreaModel.md#gettextvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:415](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L415)

___

### getTooltipAt

▸ **getTooltipAt**(`rowIndex`, `columnIndex`): `any`

The message of a formula error as tooltip.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`any`

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getTooltipAt](AbstractAreaModel.md#gettooltipat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:426](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L426)

___

### getUnfilteredRowCount

▸ **getUnfilteredRowCount**(): `number`

The number of all rows, without the external filter (the filter only shrinks [getRowCount](AreaModelObjectArray.md#getrowcount)).

#### Returns

`number`

`getAllRows().length`

**`Example`**

```ts
if (bodyAreaModel.getRowCount() === 0 && bodyAreaModel.getUnfilteredRowCount() > 0) {
  console.log("The filter hides all rows");
}
```

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:326](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L326)

___

### getValueAt

▸ **getValueAt**(`rowIndex`, `columnIndex`): `any`

Gets the value at the specified row and column indices.
This method handles tree rows and nested properties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
| `columnIndex` | `number` | The index of the column |

#### Returns

`any`

The value at the specified cell, or an empty string if not found

**`Example`**

```ts
// Get the value in the first row, second column
const value = bodyAreaModel.getValueAt(0, 1);
console.log(`The value is: ${value}`);
```

**`Example`**

```ts
// Iterate through all cells in a row
const rowIndex = 0;
for (let colIndex = 0; colIndex < columnDefs.length; colIndex++) {
  const value = bodyAreaModel.getValueAt(rowIndex, colIndex);
  console.log(`Cell (${rowIndex}, ${colIndex}): ${value}`);
}
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getValueAt](AbstractAreaModel.md#getvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:391](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L391)

___

### getValueByT

▸ **getValueByT**(`t`, `property`): `any`

Gets a value from an object using a property path.
This method supports accessing nested properties using dot notation (e.g., 'person.name').

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `t` | `T` | The object to get the value from |
| `property` | `string` | The property path to access (e.g., 'name' or 'person.contact.email') |

#### Returns

`any`

The value at the specified property path, or undefined if not found

**`Example`**

```ts
const user = { id: 1, name: 'John', contact: { email: 'john@example.com' } };

// Access simple property
const name = bodyAreaModel.getValueByT(user, 'name');
console.log(name); // 'John'

// Access nested property
const email = bodyAreaModel.getValueByT(user, 'contact.email');
console.log(email); // 'john@example.com'
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:753](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L753)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L102)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:247](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L247)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L110)

___

### invalidateColumnValues

▸ **invalidateColumnValues**(): `void`

Drops the cached aggregates and the getter lookup of calculated columns.

#### Returns

`void`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[invalidateColumnValues](AbstractAreaModel.md#invalidatecolumnvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:275](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L275)

___

### invalidateDerivedValues

▸ **invalidateDerivedValues**(`_change?`): `void`

Drops derived values: cached aggregates of formulas and „Show values as“ (called by the table on filter,
sorting, editing, `updateCells` and `api.repaint()`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_change?` | [`DerivedValuesChangeIf`](../interfaces/DerivedValuesChangeIf.md) | the changed rows (not used) |

#### Returns

`void`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:442](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L442)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:215](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L215)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:259](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L259)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L134)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L120)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L77)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L81)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:162](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L162)

___

### moveRows

▸ **moveRows**(`rowIndices`, `target`): `boolean`

Row drag: moves the rows in the display order and writes that order back to [getAllRows](AreaModelObjectArray.md#getallrows) – **in place**
(like `Array.prototype.sort`: with `TableFactory.createTableModel({ rows })` your array has the new order).
Works only without a hiding filter ([canMoveRows](AreaModelObjectArray.md#canmoverows)). The table repaints after a drop; from code use
`tableApi.moveRows()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndices` | `number`[] | display indices of the dragged rows |
| `target` | [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) | the drop target (display index before the move) |

#### Returns

`boolean`

true if moved

**`Example`**

```ts
bodyAreaModel.moveRows([2], { rowIndex: 6, position: "after" });   // row 3 becomes row 7
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:362](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L362)

___

### readPropertyPath

▸ **readPropertyPath**(`t`, `property`): `unknown`

The value of a property path – overridden by the models with their own path semantics.

#### Parameters

| Name | Type |
| :------ | :------ |
| `t` | `any` |
| `property` | `string` |

#### Returns

`unknown`

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[readPropertyPath](AbstractAreaModel.md#readpropertypath)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:475](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L475)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:297](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L297)

___

### setFocusedRowIndex

▸ **setFocusedRowIndex**(`value`): `void`

Sets the index of the focused row.
This will apply the focused row styling to the specified row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | The index of the row to focus |

#### Returns

`void`

**`Example`**

```ts
// Focus the second row (index 1)
bodyAreaModel.setFocusedRowIndex(1);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:261](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L261)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L171)

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

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L86)

___

### setRows

▸ **setRows**(`rows`): `void`

Replaces the current rows array with a new one.
This also resets the filtered rows to match the new rows array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `T`[] | The new array of row objects |

#### Returns

`void`

**`Example`**

```ts
// Replace the current rows with new data
const newRows = [
  { id: 4, name: 'Alice', age: 35 },
  { id: 5, name: 'Charlie', age: 45 }
];
bodyAreaModel.setRows(newRows);
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:279](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L279)

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

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[setValue](AbstractAreaModel.md#setvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L142)

___

### sort

▸ **sort**(`compareFn`): `void`

Sorts the filtered rows using a custom comparator function.
This method provides more flexibility than `doSort()` for complex sorting logic.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn` | (`a`: `T`, `b`: `T`) => `number` | A function that compares two rows and returns a number: - Negative if a should come before b - Positive if a should come after b - Zero if they are equivalent for sorting purposes |

#### Returns

`void`

**`Example`**

```ts
// Sort by name length
bodyAreaModel.sort((a, b) => a.name.length - b.name.length);
```

**`Example`**

```ts
// Sort by a computed value
bodyAreaModel.sort((a, b) => {
  const scoreA = a.wins * 3 + a.draws;
  const scoreB = b.wins * 3 + b.draws;
  return scoreB - scoreA; // Descending order
});
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[sort](AbstractAreaModel.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:729](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L729)
