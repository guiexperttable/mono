[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelObjectArrayWithColumndefs

# Class: AreaModelObjectArrayWithColumndefs\<T\>

Represents an area model defined by an object array with column definitions.

**`Description`**

The `AreaModelObjectArrayWithColumndefs` class extends [AreaModelObjectArray](AreaModelObjectArray.md) to provide
a specialized implementation where column definitions are a primary constructor parameter.

This class is particularly useful when working with table models where column definitions
are essential for defining the structure of the table, especially in CRUD operations
and other scenarios where column definitions need to be explicitly provided.

The main distinction from its parent class is the constructor parameter order, which
prioritizes column definitions as a required parameter rather than an optional one.

**`Example`**

```ts
// Basic usage with an array of objects and explicit column definitions
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

const bodyAreaModel = new AreaModelObjectArrayWithColumndefs<any>(
  'body',
  rows,
  columnDefs,
  30 // default row height
);
```

**`Example`**

```ts
// Using with CrudTableModelFactory
function createTableModel() {
  const rows = fetchDataFromServer();
  const columnDefs = [
    new ColumnDef('id', 'ID', new Size(50, 'px')),
    new ColumnDef('name', 'Name', new Size(150, 'px')),
    new ColumnDef('age', 'Age', new Size(100, 'px'))
  ];

  const tableModel = TableFactory.buildByTypedRowsParam({
    rows,
    columnDefs,
    tableOptions: new TableOptions(),
    fixedLeftColumnCount: 0,
    fixedRightColumnCount: 1
  });

  // The body model is an instance of AreaModelObjectArrayWithColumndefs
  const bodyModel = tableModel.getBodyModel() as AreaModelObjectArrayWithColumndefs<any>;

  // Now you can work with the body model
  return bodyModel;
}
```

**`Example`**

```ts
// Using custom row classes for selection and focus
const bodyAreaModel = new AreaModelObjectArrayWithColumndefs<any>(
  'body',
  rows,
  columnDefs,
  30, // default row height
  'my-custom-selected-row', // custom selected row class
  'my-custom-focused-row'   // custom focused row class
);
```

**`See`**

 - [AreaModelObjectArray](AreaModelObjectArray.md) - The parent class that provides the core functionality
 - [ColumnDefIf](../interfaces/ColumnDefIf.md) - The interface that defines the structure of column definitions
 - [CrudTableModelFactory](CrudTableModelFactory.md) - A factory class that uses this class for CRUD operations

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of objects in the array. Each object represents a row in the table. |

## Hierarchy

- [`AreaModelObjectArray`](AreaModelObjectArray.md)\<`T`\>

  ↳ **`AreaModelObjectArrayWithColumndefs`**

## Table of contents

### Constructors

- [constructor](AreaModelObjectArrayWithColumndefs.md#constructor)

### Properties

- [\_focusedRowIndex](AreaModelObjectArrayWithColumndefs.md#_focusedrowindex)
- [areaIdent](AreaModelObjectArrayWithColumndefs.md#areaident)
- [cellRenderers](AreaModelObjectArrayWithColumndefs.md#cellrenderers)
- [columnDefs](AreaModelObjectArrayWithColumndefs.md#columndefs)
- [defaultRowHeight](AreaModelObjectArrayWithColumndefs.md#defaultrowheight)
- [filteredRows](AreaModelObjectArrayWithColumndefs.md#filteredrows)
- [focusedRowClass](AreaModelObjectArrayWithColumndefs.md#focusedrowclass)
- [properties](AreaModelObjectArrayWithColumndefs.md#properties)
- [rowSelectionModel](AreaModelObjectArrayWithColumndefs.md#rowselectionmodel)
- [rows](AreaModelObjectArrayWithColumndefs.md#rows)
- [selectedRowClass](AreaModelObjectArrayWithColumndefs.md#selectedrowclass)
- [yPositions](AreaModelObjectArrayWithColumndefs.md#ypositions)

### Methods

- [addCalculatedClasses](AreaModelObjectArrayWithColumndefs.md#addcalculatedclasses)
- [applyShowValuesAs](AreaModelObjectArrayWithColumndefs.md#applyshowvaluesas)
- [arrayMove](AreaModelObjectArrayWithColumndefs.md#arraymove)
- [changeColumnOrder](AreaModelObjectArrayWithColumndefs.md#changecolumnorder)
- [createSortValueReader](AreaModelObjectArrayWithColumndefs.md#createsortvaluereader)
- [doSort](AreaModelObjectArrayWithColumndefs.md#dosort)
- [externalFilterChanged](AreaModelObjectArrayWithColumndefs.md#externalfilterchanged)
- [filterRowsByPredict](AreaModelObjectArrayWithColumndefs.md#filterrowsbypredict)
- [findRowFromAllRowsByAllCriteria](AreaModelObjectArrayWithColumndefs.md#findrowfromallrowsbyallcriteria)
- [findRowFromFilteredRowsByAllCriteria](AreaModelObjectArrayWithColumndefs.md#findrowfromfilteredrowsbyallcriteria)
- [genericFlatTableSortComparator](AreaModelObjectArrayWithColumndefs.md#genericflattablesortcomparator)
- [getAggregationSourceForValues](AreaModelObjectArrayWithColumndefs.md#getaggregationsourceforvalues)
- [getAllRows](AreaModelObjectArrayWithColumndefs.md#getallrows)
- [getCalculatedRenderer](AreaModelObjectArrayWithColumndefs.md#getcalculatedrenderer)
- [getCalculatedText](AreaModelObjectArrayWithColumndefs.md#getcalculatedtext)
- [getCellRenderer](AreaModelObjectArrayWithColumndefs.md#getcellrenderer)
- [getColspanAt](AreaModelObjectArrayWithColumndefs.md#getcolspanat)
- [getConstantRowHeight](AreaModelObjectArrayWithColumndefs.md#getconstantrowheight)
- [getCustomClassesAt](AreaModelObjectArrayWithColumndefs.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelObjectArrayWithColumndefs.md#getcustomstyleat)
- [getFilteredRows](AreaModelObjectArrayWithColumndefs.md#getfilteredrows)
- [getFocusedRowIndex](AreaModelObjectArrayWithColumndefs.md#getfocusedrowindex)
- [getMaxColspan](AreaModelObjectArrayWithColumndefs.md#getmaxcolspan)
- [getMaxRowspan](AreaModelObjectArrayWithColumndefs.md#getmaxrowspan)
- [getRowByIndex](AreaModelObjectArrayWithColumndefs.md#getrowbyindex)
- [getRowCount](AreaModelObjectArrayWithColumndefs.md#getrowcount)
- [getRowHeight](AreaModelObjectArrayWithColumndefs.md#getrowheight)
- [getRowValue](AreaModelObjectArrayWithColumndefs.md#getrowvalue)
- [getRowspanAt](AreaModelObjectArrayWithColumndefs.md#getrowspanat)
- [getTextValueAt](AreaModelObjectArrayWithColumndefs.md#gettextvalueat)
- [getTooltipAt](AreaModelObjectArrayWithColumndefs.md#gettooltipat)
- [getUnfilteredRowCount](AreaModelObjectArrayWithColumndefs.md#getunfilteredrowcount)
- [getValueAt](AreaModelObjectArrayWithColumndefs.md#getvalueat)
- [getValueByT](AreaModelObjectArrayWithColumndefs.md#getvaluebyt)
- [getYPosByRowIndex](AreaModelObjectArrayWithColumndefs.md#getyposbyrowindex)
- [hasDerivedColumns](AreaModelObjectArrayWithColumndefs.md#hasderivedcolumns)
- [init](AreaModelObjectArrayWithColumndefs.md#init)
- [invalidateColumnValues](AreaModelObjectArrayWithColumndefs.md#invalidatecolumnvalues)
- [invalidateDerivedValues](AreaModelObjectArrayWithColumndefs.md#invalidatederivedvalues)
- [isCalculatedProperty](AreaModelObjectArrayWithColumndefs.md#iscalculatedproperty)
- [isDerivedProperty](AreaModelObjectArrayWithColumndefs.md#isderivedproperty)
- [isEditable](AreaModelObjectArrayWithColumndefs.md#iseditable)
- [isFilterable](AreaModelObjectArrayWithColumndefs.md#isfilterable)
- [isRowCheckable](AreaModelObjectArrayWithColumndefs.md#isrowcheckable)
- [isRowChecked](AreaModelObjectArrayWithColumndefs.md#isrowchecked)
- [isSelectable](AreaModelObjectArrayWithColumndefs.md#isselectable)
- [readPropertyPath](AreaModelObjectArrayWithColumndefs.md#readpropertypath)
- [setCalculatedValue](AreaModelObjectArrayWithColumndefs.md#setcalculatedvalue)
- [setFocusedRowIndex](AreaModelObjectArrayWithColumndefs.md#setfocusedrowindex)
- [setPropertyValue](AreaModelObjectArrayWithColumndefs.md#setpropertyvalue)
- [setRowChecked](AreaModelObjectArrayWithColumndefs.md#setrowchecked)
- [setRows](AreaModelObjectArrayWithColumndefs.md#setrows)
- [setValue](AreaModelObjectArrayWithColumndefs.md#setvalue)
- [sort](AreaModelObjectArrayWithColumndefs.md#sort)

## Constructors

### constructor

• **new AreaModelObjectArrayWithColumndefs**\<`T`\>(`areaIdent`, `rows`, `columnDefs`, `defaultRowHeight`, `selectedRowClass?`, `focusedRowClass?`): [`AreaModelObjectArrayWithColumndefs`](AreaModelObjectArrayWithColumndefs.md)\<`T`\>

Creates an instance of AreaModelObjectArrayWithColumndefs.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` | Identifies which area of the table this model represents ('header', 'body', or 'footer') |
| `rows` | `T`[] | `undefined` | The array of objects that represent the rows in this area |
| `columnDefs` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] | `undefined` | Definitions for the columns in this area (required parameter) |
| `defaultRowHeight` | `number` | `undefined` | The default height for rows in this area (in pixels) |
| `selectedRowClass?` | `string` | `'ge-selected-row'` | CSS class to apply to selected rows |
| `focusedRowClass?` | `string` | `'ge-focused-row'` | CSS class to apply to the focused row |

#### Returns

[`AreaModelObjectArrayWithColumndefs`](AreaModelObjectArrayWithColumndefs.md)\<`T`\>

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

const bodyAreaModel = new AreaModelObjectArrayWithColumndefs(
  'body',
  rows,
  columnDefs,
  30
);
```

#### Overrides

[AreaModelObjectArray](AreaModelObjectArray.md).[constructor](AreaModelObjectArray.md#constructor)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts#L121)

## Properties

### \_focusedRowIndex

• **\_focusedRowIndex**: `number` = `0`

The index of the currently focused row.
This is used to apply the focused row styling.

**`Default`**

```ts
0
```

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[_focusedRowIndex](AreaModelObjectArray.md#_focusedrowindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:234](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L234)

___

### areaIdent

• **areaIdent**: [`AreaIdent`](../modules.md#areaident)

Identifies which area of the table this model represents ('header', 'body', or 'footer')

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[areaIdent](AreaModelObjectArray.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts#L122)

___

### cellRenderers

• `Protected` **cellRenderers**: (`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md))[]

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[cellRenderers](AreaModelObjectArray.md#cellrenderers)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L23)

___

### columnDefs

• `Protected` `Readonly` **columnDefs**: [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[]

Definitions for the columns in this area (required parameter)

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[columnDefs](AreaModelObjectArray.md#columndefs)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts#L124)

___

### defaultRowHeight

• **defaultRowHeight**: `number`

The default height for rows in this area (in pixels)

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[defaultRowHeight](AreaModelObjectArray.md#defaultrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts#L125)

___

### filteredRows

• `Protected` **filteredRows**: `T`[]

A copy of the rows array that can be filtered and sorted without affecting the original data.
This array is used for rendering the table and is updated when filtering or sorting is applied.

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[filteredRows](AreaModelObjectArray.md#filteredrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:172](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L172)

___

### focusedRowClass

• **focusedRowClass**: `string` = `'ge-focused-row'`

CSS class to apply to the focused row

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[focusedRowClass](AreaModelObjectArray.md#focusedrowclass)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:220](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L220)

___

### properties

• `Protected` `Readonly` **properties**: `string`[]

An array of property names extracted from the column definitions.
These properties are used to access values from the row objects.

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[properties](AreaModelObjectArray.md#properties)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L164)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[rowSelectionModel](AreaModelObjectArray.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L20)

___

### rows

• `Protected` **rows**: `T`[]

The array of objects that represent the rows in this area

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[rows](AreaModelObjectArray.md#rows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array-with-columndefs.ts#L123)

___

### selectedRowClass

• **selectedRowClass**: `string` = `'ge-selected-row'`

CSS class to apply to selected rows

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[selectedRowClass](AreaModelObjectArray.md#selectedrowclass)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L219)

___

### yPositions

• `Protected` **yPositions**: `number`[] = `[]`

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[yPositions](AreaModelObjectArray.md#ypositions)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[addCalculatedClasses](AreaModelObjectArray.md#addcalculatedclasses)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:327](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L327)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[applyShowValuesAs](AreaModelObjectArray.md#applyshowvaluesas)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:406](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L406)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[arrayMove](AreaModelObjectArray.md#arraymove)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:186](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L186)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[changeColumnOrder](AreaModelObjectArray.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:743](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L743)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[createSortValueReader](AreaModelObjectArray.md#createsortvaluereader)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:823](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L823)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[doSort](AreaModelObjectArray.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:646](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L646)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[externalFilterChanged](AreaModelObjectArray.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:618](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L618)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[filterRowsByPredict](AreaModelObjectArray.md#filterrowsbypredict)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:293](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L293)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[findRowFromAllRowsByAllCriteria](AreaModelObjectArray.md#findrowfromallrowsbyallcriteria)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:541](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L541)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[findRowFromFilteredRowsByAllCriteria](AreaModelObjectArray.md#findrowfromfilteredrowsbyallcriteria)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:510](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L510)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[genericFlatTableSortComparator](AreaModelObjectArray.md#genericflattablesortcomparator)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:796](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L796)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getAggregationSourceForValues](AreaModelObjectArray.md#getaggregationsourceforvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:440](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L440)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getAllRows](AreaModelObjectArray.md#getallrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:481](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L481)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getCalculatedRenderer](AreaModelObjectArray.md#getcalculatedrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:319](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L319)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getCalculatedText](AreaModelObjectArray.md#getcalculatedtext)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getCellRenderer](AreaModelObjectArray.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:379](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L379)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getColspanAt](AreaModelObjectArray.md#getcolspanat)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getConstantRowHeight](AreaModelObjectArray.md#getconstantrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:569](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L569)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getCustomClassesAt](AreaModelObjectArray.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:767](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L767)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getCustomStyleAt](AreaModelObjectArray.md#getcustomstyleat)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getFilteredRows](AreaModelObjectArray.md#getfilteredrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:463](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L463)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getFocusedRowIndex](AreaModelObjectArray.md#getfocusedrowindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:245](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L245)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getMaxColspan](AreaModelObjectArray.md#getmaxcolspan)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getMaxRowspan](AreaModelObjectArray.md#getmaxrowspan)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getRowByIndex](AreaModelObjectArray.md#getrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:593](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L593)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getRowCount](AreaModelObjectArray.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:308](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L308)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getRowHeight](AreaModelObjectArray.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:559](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L559)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getRowValue](AreaModelObjectArray.md#getrowvalue)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getRowspanAt](AreaModelObjectArray.md#getrowspanat)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getTextValueAt](AreaModelObjectArray.md#gettextvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:373](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L373)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getTooltipAt](AreaModelObjectArray.md#gettooltipat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:384](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L384)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getUnfilteredRowCount](AreaModelObjectArray.md#getunfilteredrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:324](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L324)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getValueAt](AreaModelObjectArray.md#getvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:349](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L349)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[getValueByT](AreaModelObjectArray.md#getvaluebyt)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:711](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L711)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[getYPosByRowIndex](AreaModelObjectArray.md#getyposbyrowindex)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[hasDerivedColumns](AreaModelObjectArray.md#hasderivedcolumns)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[init](AreaModelObjectArray.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L110)

___

### invalidateColumnValues

▸ **invalidateColumnValues**(): `void`

Drops the cached aggregates and the getter lookup of calculated columns.

#### Returns

`void`

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[invalidateColumnValues](AreaModelObjectArray.md#invalidatecolumnvalues)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[invalidateDerivedValues](AreaModelObjectArray.md#invalidatederivedvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:400](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L400)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isCalculatedProperty](AreaModelObjectArray.md#iscalculatedproperty)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isDerivedProperty](AreaModelObjectArray.md#isderivedproperty)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isEditable](AreaModelObjectArray.md#iseditable)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isFilterable](AreaModelObjectArray.md#isfilterable)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isRowCheckable](AreaModelObjectArray.md#isrowcheckable)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isRowChecked](AreaModelObjectArray.md#isrowchecked)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[isSelectable](AreaModelObjectArray.md#isselectable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:162](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L162)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[readPropertyPath](AreaModelObjectArray.md#readpropertypath)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:433](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L433)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[setCalculatedValue](AreaModelObjectArray.md#setcalculatedvalue)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[setFocusedRowIndex](AreaModelObjectArray.md#setfocusedrowindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:259](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L259)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[setPropertyValue](AreaModelObjectArray.md#setpropertyvalue)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[setRowChecked](AreaModelObjectArray.md#setrowchecked)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[setRows](AreaModelObjectArray.md#setrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:277](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L277)

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

[AreaModelObjectArray](AreaModelObjectArray.md).[setValue](AreaModelObjectArray.md#setvalue)

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

#### Inherited from

[AreaModelObjectArray](AreaModelObjectArray.md).[sort](AreaModelObjectArray.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts:687](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-object-array.ts#L687)
