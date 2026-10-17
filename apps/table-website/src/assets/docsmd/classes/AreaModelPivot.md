[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelPivot

# Class: AreaModelPivot\<T\>

The body of a pivot table: one row per row group (a tree for several row fields, with subtotals in the group rows),
one column per column key × value, plus subtotal and total columns. Created by [PivotFactory.createTableModel](PivotFactory.md#createtablemodel)
– the factory also builds the grouped header and the total row.

It is a tree ([AreaModelTree](AreaModelTree.md), `isAreaModelTree` is true): rows are tree rows with a [RowGroupIf](../interfaces/RowGroupIf.md) as
`data`; expanding, `tableApi.expandAll()`, keyboard, screen reader attributes and remembering expanded rows work as
in a tree table. The cells come from a [PivotResult](PivotResult.md) ([getResult](AreaModelPivot.md#getresult)).

- **Filter**: `externalFilterFunction` gets your **source objects** (as in a flat table and a row grouping) – it
  filters before the aggregation; all cells and totals follow. Rows without a matching source row disappear; the
  columns stay (they come from all rows).
- **Sorting**: by a value column → the rows of every level by that value (empty cells last); by the group column →
  by key. `tableApi.sort(fn)` compares two [RowGroupIf](../interfaces/RowGroupIf.md).
- Cells are not editable. Changed source data: [TableApi.setPivotConfig](TableApi.md#setpivotconfig) with new rows or `tableApi.repaint()` (same
  keys), new keys or fields: [TableApi.setPivotConfig](TableApi.md#setpivotconfig).

**`Example`**

```ts
const tableModel = PivotFactory.createTableModel<Sale>({
  rows: sales, rowFields: ["region"], columnFields: ["monat"], values: ["umsatz"]
});
const pivotBody = tableModel.getPivotBody();
pivotBody.getValueAt(0, pivotBody.getColumnIndex(["Jan"]));   // 150 – Nord, Jan
```

**`See`**

Training: [Pivot tables](https://gui.expert/training/pivot-tables/)

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Hierarchy

- [`AreaModelTree`](AreaModelTree.md)\<`any`\>

  ↳ **`AreaModelPivot`**

## Table of contents

### Constructors

- [constructor](AreaModelPivot.md#constructor)

### Properties

- [areaIdent](AreaModelPivot.md#areaident)
- [cellRenderers](AreaModelPivot.md#cellrenderers)
- [columnDefs](AreaModelPivot.md#columndefs)
- [defaultEditable](AreaModelPivot.md#defaulteditable)
- [defaultRowHeight](AreaModelPivot.md#defaultrowheight)
- [kind](AreaModelPivot.md#kind)
- [properties](AreaModelPivot.md#properties)
- [rowSelectionModel](AreaModelPivot.md#rowselectionmodel)
- [rows](AreaModelPivot.md#rows)
- [type](AreaModelPivot.md#type)
- [yPositions](AreaModelPivot.md#ypositions)

### Methods

- [addCalculatedClasses](AreaModelPivot.md#addcalculatedclasses)
- [applyShowValuesAs](AreaModelPivot.md#applyshowvaluesas)
- [arrayMove](AreaModelPivot.md#arraymove)
- [canMoveRows](AreaModelPivot.md#canmoverows)
- [changeColumnOrder](AreaModelPivot.md#changecolumnorder)
- [doSort](AreaModelPivot.md#dosort)
- [externalFilterChanged](AreaModelPivot.md#externalfilterchanged)
- [genericTreeTableSortComparator](AreaModelPivot.md#generictreetablesortcomparator)
- [getAggregationSourceForValues](AreaModelPivot.md#getaggregationsourceforvalues)
- [getBuildCount](AreaModelPivot.md#getbuildcount)
- [getCalculatedRenderer](AreaModelPivot.md#getcalculatedrenderer)
- [getCalculatedText](AreaModelPivot.md#getcalculatedtext)
- [getCellRenderer](AreaModelPivot.md#getcellrenderer)
- [getCellSourceRows](AreaModelPivot.md#getcellsourcerows)
- [getColspanAt](AreaModelPivot.md#getcolspanat)
- [getColumnIndex](AreaModelPivot.md#getcolumnindex)
- [getColumnInfo](AreaModelPivot.md#getcolumninfo)
- [getColumnProperty](AreaModelPivot.md#getcolumnproperty)
- [getConfig](AreaModelPivot.md#getconfig)
- [getConstantRowHeight](AreaModelPivot.md#getconstantrowheight)
- [getCustomClassesAt](AreaModelPivot.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelPivot.md#getcustomstyleat)
- [getDisplayedChildren](AreaModelPivot.md#getdisplayedchildren)
- [getDisplayedRootRows](AreaModelPivot.md#getdisplayedrootrows)
- [getFilteredFlattenRows](AreaModelPivot.md#getfilteredflattenrows)
- [getGroupLabel](AreaModelPivot.md#getgrouplabel)
- [getLeafRows](AreaModelPivot.md#getleafrows)
- [getMaxColspan](AreaModelPivot.md#getmaxcolspan)
- [getMaxRowspan](AreaModelPivot.md#getmaxrowspan)
- [getPropertyAt](AreaModelPivot.md#getpropertyat)
- [getRawValueOfRow](AreaModelPivot.md#getrawvalueofrow)
- [getResult](AreaModelPivot.md#getresult)
- [getRowByIndex](AreaModelPivot.md#getrowbyindex)
- [getRowCount](AreaModelPivot.md#getrowcount)
- [getRowGroup](AreaModelPivot.md#getrowgroup)
- [getRowHeight](AreaModelPivot.md#getrowheight)
- [getRowValue](AreaModelPivot.md#getrowvalue)
- [getRowspanAt](AreaModelPivot.md#getrowspanat)
- [getShownValue](AreaModelPivot.md#getshownvalue)
- [getSourceRows](AreaModelPivot.md#getsourcerows)
- [getTextValueAt](AreaModelPivot.md#gettextvalueat)
- [getTooltipAt](AreaModelPivot.md#gettooltipat)
- [getUnfilteredRowCount](AreaModelPivot.md#getunfilteredrowcount)
- [getValueAt](AreaModelPivot.md#getvalueat)
- [getValueByT](AreaModelPivot.md#getvaluebyt)
- [getYPosByRowIndex](AreaModelPivot.md#getyposbyrowindex)
- [hasDerivedColumns](AreaModelPivot.md#hasderivedcolumns)
- [hasDisplayedChildren](AreaModelPivot.md#hasdisplayedchildren)
- [init](AreaModelPivot.md#init)
- [invalidateColumnValues](AreaModelPivot.md#invalidatecolumnvalues)
- [invalidateDerivedValues](AreaModelPivot.md#invalidatederivedvalues)
- [isCalculatedProperty](AreaModelPivot.md#iscalculatedproperty)
- [isDerivedProperty](AreaModelPivot.md#isderivedproperty)
- [isEditable](AreaModelPivot.md#iseditable)
- [isFilterable](AreaModelPivot.md#isfilterable)
- [isRowCheckable](AreaModelPivot.md#isrowcheckable)
- [isRowChecked](AreaModelPivot.md#isrowchecked)
- [isRowHeaderCell](AreaModelPivot.md#isrowheadercell)
- [isSelectable](AreaModelPivot.md#isselectable)
- [moveRows](AreaModelPivot.md#moverows)
- [readPropertyPath](AreaModelPivot.md#readpropertypath)
- [recalcVisibleTreeRows](AreaModelPivot.md#recalcvisibletreerows)
- [setAllParentsOk](AreaModelPivot.md#setallparentsok)
- [setCalculatedValue](AreaModelPivot.md#setcalculatedvalue)
- [setPropertyValue](AreaModelPivot.md#setpropertyvalue)
- [setRowChecked](AreaModelPivot.md#setrowchecked)
- [setValue](AreaModelPivot.md#setvalue)
- [sort](AreaModelPivot.md#sort)
- [toggleExpandCollapseAll](AreaModelPivot.md#toggleexpandcollapseall)

## Constructors

### constructor

• **new AreaModelPivot**\<`T`\>(`rows`, `config`, `groupColumn?`, `defaultRowHeight?`): [`AreaModelPivot`](AreaModelPivot.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rows` | `T`[] | `undefined` | the source rows (not changed) |
| `config` | [`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`T`\> | `undefined` | row fields, column fields, values |
| `groupColumn?` | `Partial`\<[`RowGroupColumnOptionsIf`](../interfaces/RowGroupColumnOptionsIf.md)\<`T`\>\> | `{}` | label options of the group column (`showCount`, `label`) |
| `defaultRowHeight?` | `number` | `34` | row height in px |

#### Returns

[`AreaModelPivot`](AreaModelPivot.md)\<`T`\>

#### Overrides

[AreaModelTree](AreaModelTree.md).[constructor](AreaModelTree.md#constructor)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L79)

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

[AreaModelTree](AreaModelTree.md).[areaIdent](AreaModelTree.md#areaident)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L71)

___

### cellRenderers

• `Protected` **cellRenderers**: (`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md))[]

#### Inherited from

[AreaModelTree](AreaModelTree.md).[cellRenderers](AreaModelTree.md#cellrenderers)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L25)

___

### columnDefs

• `Protected` **columnDefs**: [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] = `[]`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[columnDefs](AreaModelTree.md#columndefs)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L74)

___

### defaultEditable

• **defaultEditable**: `boolean` = `false`

Columns without an own `editable` are editable (Excel-style editing, `EditingOptionsIf.defaultEditable`; set by
the table). Row number, checkbox and group columns stay read only.

**`Since`**

1.1.99

#### Inherited from

[AreaModelTree](AreaModelTree.md).[defaultEditable](AreaModelTree.md#defaulteditable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L150)

___

### defaultRowHeight

• **defaultRowHeight**: `number`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[defaultRowHeight](AreaModelTree.md#defaultrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L73)

___

### kind

• `Readonly` **kind**: ``"AreaModelPivot"``

Marker for [isAreaModelPivot](../modules.md#isareamodelpivot) (works across copies of the core). `type` stays `"AreaModelTree"`.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L59)

___

### properties

• `Protected` `Readonly` **properties**: `string`[]

#### Inherited from

[AreaModelTree](AreaModelTree.md).[properties](AreaModelTree.md#properties)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L55)

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

[AreaModelTree](AreaModelTree.md).[rowSelectionModel](AreaModelTree.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L22)

___

### rows

• `Readonly` **rows**: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

#### Inherited from

[AreaModelTree](AreaModelTree.md).[rows](AreaModelTree.md#rows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L72)

___

### type

• **type**: `string` = `'AreaModelTree'`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[type](AreaModelTree.md#type)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L53)

___

### yPositions

• `Protected` **yPositions**: `number`[] = `[]`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[yPositions](AreaModelTree.md#ypositions)

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

[AreaModelTree](AreaModelTree.md).[addCalculatedClasses](AreaModelTree.md#addcalculatedclasses)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:356](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L356)

___

### applyShowValuesAs

▸ **applyShowValuesAs**(`row`, `property`, `value`, `options`): `unknown`

„Show values as“ of one tree row: percentages of the column total relate to the (filtered) leaf rows,
`percentOfParentTotal`, `runningTotal`, `differenceFromPrevious` and `rank` to the displayed siblings.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |
| `property` | `string` |
| `value` | `unknown` |
| `options` | [`ShowValuesAsIf`](../interfaces/ShowValuesAsIf.md) |

#### Returns

`unknown`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[applyShowValuesAs](AreaModelTree.md#applyshowvaluesas)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:334](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L334)

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

[AreaModelTree](AreaModelTree.md).[arrayMove](AreaModelTree.md#arraymove)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:208](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L208)

___

### canMoveRows

▸ **canMoveRows**(`_rowIndices`, `_target`): `boolean`

Row drag: `false` – the table does not move rows of a pivot table itself (pivot rows are aggregates). With
`rowDragOptions.managed: false` the app gets the events and decides.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_rowIndices` | `number`[] |
| `_target` | [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) |

#### Returns

`boolean`

always false

**`Since`**

1.1.95

#### Overrides

[AreaModelTree](AreaModelTree.md).[canMoveRows](AreaModelTree.md#canmoverows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:351](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L351)

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

[AreaModelTree](AreaModelTree.md).[changeColumnOrder](AreaModelTree.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L81)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the rows of every level: by a value column by its values (empty cells last, in both directions), by the
group column by key. A new pivot ([TableApi.setPivotConfig](TableApi.md#setpivotconfig)) starts unsorted (the columns are different).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | primary key first |

#### Returns

`boolean`

false for an empty list

**`Example`**

```ts
pivotBody.doSort([new SortItem(pivotBody.getColumnIndex([]), "desc")]);   // by the total, largest first
tableApi.repaint();
```

#### Overrides

[AreaModelTree](AreaModelTree.md).[doSort](AreaModelTree.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:467](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L467)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`S`\>(`predictFn`): `void`

Filters the **source rows** before the aggregation: `predictFn` gets your objects (as in a flat table), index and
array of the source rows. All cells and totals follow; rows without a matching source row disappear. Usually
called by `tableApi.externalFilterChanged()` with `tableOptions.externalFilterFunction`.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`S`\> | returns a truthy value for the rows to count |

#### Returns

`void`

**`Example`**

```ts
tableOptions.externalFilterFunction = (sale: Sale) => sale.produkt === "A";
tableApi.externalFilterChanged();   // Nord: Jan 100, Feb 120 · Süd: Jan 80, Feb 30
```

#### Overrides

[AreaModelTree](AreaModelTree.md).[externalFilterChanged](AreaModelTree.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:446](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L446)

___

### genericTreeTableSortComparator

▸ **genericTreeTableSortComparator**(`property`, `f`): (`a`: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>, `b`: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>) => `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `f` | `number` |

#### Returns

`fn`

▸ (`a`, `b`): `number`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |
| `b` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |

##### Returns

`number`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[genericTreeTableSortComparator](AreaModelTree.md#generictreetablesortcomparator)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:537](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L537)

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

[AreaModelTree](AreaModelTree.md).[getAggregationSourceForValues](AreaModelTree.md#getaggregationsourceforvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:369](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L369)

___

### getBuildCount

▸ **getBuildCount**(): `number`

Counts how often the pivot was built (start, new configuration, new rows).

#### Returns

`number`

the number of builds

**`Example`**

```ts
const before = pivotBody.getBuildCount();
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:137](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L137)

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

[AreaModelTree](AreaModelTree.md).[getCalculatedRenderer](AreaModelTree.md#getcalculatedrenderer)

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

[AreaModelTree](AreaModelTree.md).[getCalculatedText](AreaModelTree.md#getcalculatedtext)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L336)

___

### getCellRenderer

▸ **getCellRenderer**(`_rowIndex`, `columnIndex`): `undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

Value columns: the [AggregateCellRenderer](AggregateCellRenderer.md) (text node); the group column: none (label as text).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`undefined` \| [`CellRendererIf`](../interfaces/CellRendererIf.md)

#### Overrides

[AreaModelTree](AreaModelTree.md).[getCellRenderer](AreaModelTree.md#getcellrenderer)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:382](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L382)

___

### getCellSourceRows

▸ **getCellSourceRows**(`rowIndex`, `columnIndex`): `T`[]

The source rows behind a cell (drill-down): the rows of its row group and column key that the filter keeps.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | index of the displayed body row |
| `columnIndex` | `number` | column index (the group column: all rows of the row group) |

#### Returns

`T`[]

a new array in source order

**`Example`**

```ts
pivotBody.getCellSourceRows(0, 1).map(s => s.umsatz);   // [100, 50] – Nord, Jan
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:271](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L271)

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

[AreaModelTree](AreaModelTree.md).[getColspanAt](AreaModelTree.md#getcolspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L65)

___

### getColumnIndex

▸ **getColumnIndex**(`columnPath`, `value?`): `number`

The index of a value column (see [getColumnProperty](AreaModelPivot.md#getcolumnproperty)).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `columnPath` | `unknown`[] | `undefined` | the column keys, `[]` = the total column |
| `value?` | `string` \| `number` | `0` | the index or name of the value |

#### Returns

`number`

the column index or -1

**`Example`**

```ts
pivotBody.getColumnIndex(["Jan"]);   // 1
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:256](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L256)

___

### getColumnInfo

▸ **getColumnInfo**(`columnIndex`): `undefined` \| [`PivotColumnInfoIf`](../interfaces/PivotColumnInfoIf.md)

What a column shows: a column key, a subtotal or a total, and which value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | column index |

#### Returns

`undefined` \| [`PivotColumnInfoIf`](../interfaces/PivotColumnInfoIf.md)

undefined for the group column (and row numbers)

**`Example`**

```ts
pivotBody.getColumnInfo(1)?.column?.label;   // "Jan"
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:211](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L211)

___

### getColumnProperty

▸ **getColumnProperty**(`columnPath`, `value?`): `undefined` \| `string`

The property of a value column – for `tableApi.getColumnIndex()`, `sortByColumn()`, `setColumnWidth()` …

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `columnPath` | `unknown`[] | `undefined` | the column keys from the top column field down, e.g. `[2026, 1]`; `[]` = the total column |
| `value?` | `string` \| `number` | `0` | the index or name of the value |

#### Returns

`undefined` \| `string`

the property, undefined if there is no such column

**`Example`**

```ts
tableApi.sortByColumn(pivotBody.getColumnProperty([])!, "desc");   // rows by their total, largest first
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:226](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L226)

___

### getConfig

▸ **getConfig**(): [`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`T`\>

The current configuration.

#### Returns

[`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`T`\>

a copy

**`Example`**

```ts
pivotBody.getConfig().columnFields;   // ["monat"]
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L97)

___

### getConstantRowHeight

▸ **getConstantRowHeight**(): `undefined` \| `number`

All rows share `defaultRowHeight` – unless a subclass overrides `getRowHeight()`, then row heights may
vary and `undefined` is returned.

#### Returns

`undefined` \| `number`

The constant row height or `undefined`.

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getConstantRowHeight](AreaModelTree.md#getconstantrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:387](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L387)

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

#### Overrides

[AreaModelTree](AreaModelTree.md).[getCustomClassesAt](AreaModelTree.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:390](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L390)

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

[AreaModelTree](AreaModelTree.md).[getCustomStyleAt](AreaModelTree.md#getcustomstyleat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L76)

___

### getDisplayedChildren

▸ **getDisplayedChildren**(`row`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

The displayed children of a row (in display order): all children, with an active filter only those that match
(or have a matching descendant). They are on screen if the row is expanded.
Used for the screen reader attributes `aria-setsize` / `aria-posinset` of tree rows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> | a tree row of this model |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

the displayed children (empty for a leaf)

**`Example`**

```ts
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
const shown = treeModel.getDisplayedChildren(treeModel.rows[0]).length;
```

**`Since`**

1.1.91

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getDisplayedChildren](AreaModelTree.md#getdisplayedchildren)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L145)

___

### getDisplayedRootRows

▸ **getDisplayedRootRows**(): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

The displayed top-level rows: all of [rows](AreaModelTree.md#rows), with an active filter only the matching ones (or with a
matching descendant).

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

the top-level rows that are shown

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getDisplayedRootRows](AreaModelTree.md#getdisplayedrootrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L114)

___

### getFilteredFlattenRows

▸ **getFilteredFlattenRows**(): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

The displayed rows: all parents expanded and accepted by the active filter, in display order.

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

the displayed tree rows (do not modify the array)

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getFilteredFlattenRows](AreaModelTree.md#getfilteredflattenrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L176)

___

### getGroupLabel

▸ **getGroupLabel**(`group`): `string`

The label of a row in the group column.

#### Parameters

| Name | Type |
| :------ | :------ |
| `group` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> |

#### Returns

`string`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:518](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L518)

___

### getLeafRows

▸ **getLeafRows**(`filtered?`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

The leaves (rows without children) of the whole tree, depth-first in the current order – independent of the
expanded state. Used for totals: collapsing a node does not change them, and parent rows are not counted twice.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filtered?` | `boolean` | `true` | only the leaves the active filter keeps (`externalFilterChanged`); `false`: all |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>[]

a new array

**`Example`**

```ts
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
const total = aggregate(treeModel.getLeafRows(), row => row.data.total, "sum");
```

**`Since`**

1.1.94

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getLeafRows](AreaModelTree.md#getleafrows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L165)

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

[AreaModelTree](AreaModelTree.md).[getMaxColspan](AreaModelTree.md#getmaxcolspan)

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

[AreaModelTree](AreaModelTree.md).[getMaxRowspan](AreaModelTree.md#getmaxrowspan)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L108)

___

### getPropertyAt

▸ **getPropertyAt**(`columnIndex`): `undefined` \| `string`

The property of a column (follows moved columns).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | column index |

#### Returns

`undefined` \| `string`

the property, e.g. [RowGroupColumnDef.PROPERTY](RowGroupColumnDef.md#property-1) for the group column

**`Example`**

```ts
pivotBody.getPropertyAt(0);   // "RowGroupColumn"
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L184)

___

### getRawValueOfRow

▸ **getRawValueOfRow**(`row`, `prop`): `any`

The value of a tree row for a property – before „Show values as“: the computed value of a calculated column,
otherwise the property (path) of `row.data`. Subclasses (row groups) return their aggregates for group rows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> | the tree row |
| `prop` | `string` | the property of the column |

#### Returns

`any`

the raw value

**`Since`**

1.1.95

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getRawValueOfRow](AreaModelTree.md#getrawvalueofrow)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:279](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L279)

___

### getResult

▸ **getResult**(): [`PivotResult`](PivotResult.md)\<`T`\>

The pivot: row and column hierarchies and all values (also subtotals and totals) – for drill-down, own
evaluations or a chart next to the table.

#### Returns

[`PivotResult`](PivotResult.md)\<`T`\>

the result (do not modify)

**`Example`**

```ts
const result = pivotBody.getResult();
result.columnLeaves.map(c => c.label);   // ["Jan", "Feb"]
result.getValue();                       // 450
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L112)

___

### getRowByIndex

▸ **getRowByIndex**(`idx`): `undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>

Returns the row object at the specified index.
This method provides access to the underlying data structure.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `idx` | `number` | The index of the row |

#### Returns

`undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\>

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

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getRowByIndex](AreaModelTree.md#getrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:398](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L398)

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

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getRowCount](AreaModelTree.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L180)

___

### getRowGroup

▸ **getRowGroup**(`rowIndex`): `undefined` \| [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\>

The row group of a displayed row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | index of the displayed body row |

#### Returns

`undefined` \| [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\>

the group, undefined for the total row of a pivot without row fields

**`Example`**

```ts
pivotBody.getRowGroup(0)?.path;   // ["Nord"]
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:197](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L197)

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

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getRowHeight](AreaModelTree.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:377](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L377)

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

[AreaModelTree](AreaModelTree.md).[getRowValue](AreaModelTree.md#getrowvalue)

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

[AreaModelTree](AreaModelTree.md).[getRowspanAt](AreaModelTree.md#getrowspanat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L80)

___

### getShownValue

▸ **getShownValue**(`group`, `info`): `unknown`

The value of a pivot cell as shown: the aggregate, or with „Show values as“ ([PivotValueIf.showValuesAs](../interfaces/PivotValueIf.md#showvaluesas))
its share of the row total, column total, grand total or parent row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `group` | `undefined` \| [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | the row group; `undefined` = all rows (the total row) |
| `info` | [`PivotColumnInfoIf`](../interfaces/PivotColumnInfoIf.md) | the column ([getColumnInfo](AreaModelPivot.md#getcolumninfo)) |

#### Returns

`unknown`

the shown value, `undefined` for an empty cell

**`Example`**

```ts
const body = (tableModel as PivotTableModel).getPivotBody();
body.getShownValue(body.getRowGroup(0), body.getColumnInfo(2)!);   // 0.4 – 40 % of the row
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:315](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L315)

___

### getSourceRows

▸ **getSourceRows**(): `T`[]

The rows the pivot is built from.

#### Returns

`T`[]

the source rows (do not modify the array – use `tableApi.setPivotConfig({}, rows)`)

**`Example`**

```ts
pivotBody.getSourceRows().length;   // 6
```

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L125)

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

[AreaModelTree](AreaModelTree.md).[getTextValueAt](AreaModelTree.md#gettextvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:365](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L365)

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

[AreaModelTree](AreaModelTree.md).[getTooltipAt](AreaModelTree.md#gettooltipat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:309](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L309)

___

### getUnfilteredRowCount

▸ **getUnfilteredRowCount**(): `number`

The number of rows the tree shows without the external filter: all nodes whose parents are expanded
(collapsed children do not count). `0` only for a tree without rows.

#### Returns

`number`

displayed rows before filtering

**`Since`**

1.1.92

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getUnfilteredRowCount](AreaModelTree.md#getunfilteredrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L192)

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

[AreaModelTree](AreaModelTree.md).[getValueAt](AreaModelTree.md#getvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:281](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L281)

___

### getValueByT

▸ **getValueByT**(`t`, `property`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `t` | `any` |
| `property` | `string` |

#### Returns

`any`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[getValueByT](AreaModelTree.md#getvaluebyt)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:402](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L402)

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

[AreaModelTree](AreaModelTree.md).[getYPosByRowIndex](AreaModelTree.md#getyposbyrowindex)

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

[AreaModelTree](AreaModelTree.md).[hasDerivedColumns](AreaModelTree.md#hasderivedcolumns)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:270](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L270)

___

### hasDisplayedChildren

▸ **hasDisplayedChildren**(`row`): `boolean`

True if the row has children that are shown when it is expanded – with an active filter only children that
match (or have a matching descendant) count. The arrow of a row without such children is hidden.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> | a tree row of this model |

#### Returns

`boolean`

true if the row has displayed children

#### Inherited from

[AreaModelTree](AreaModelTree.md).[hasDisplayedChildren](AreaModelTree.md#hasdisplayedchildren)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L125)

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

[AreaModelTree](AreaModelTree.md).[init](AreaModelTree.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L121)

___

### invalidateColumnValues

▸ **invalidateColumnValues**(): `void`

Drops the cached aggregates and the getter lookup of calculated columns.

#### Returns

`void`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[invalidateColumnValues](AreaModelTree.md#invalidatecolumnvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:303](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L303)

___

### invalidateDerivedValues

▸ **invalidateDerivedValues**(): `void`

Computes the cells again on the next read – the table calls it after filter, sorting and `tableApi.repaint()`.

#### Returns

`void`

**`Example`**

```ts
sales[0].umsatz = 999;   // changed outside the table
tableApi.repaint();      // calls invalidateDerivedValues() – all cells are computed again
```

#### Overrides

[AreaModelTree](AreaModelTree.md).[invalidateDerivedValues](AreaModelTree.md#invalidatederivedvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:505](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L505)

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

[AreaModelTree](AreaModelTree.md).[isCalculatedProperty](AreaModelTree.md#iscalculatedproperty)

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

[AreaModelTree](AreaModelTree.md).[isDerivedProperty](AreaModelTree.md#isderivedproperty)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:282](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L282)

___

### isEditable

▸ **isEditable**(`_rowIndex`, `_columnIndex`): `boolean`

Pivot cells are computed – not editable.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_rowIndex` | `number` |
| `_columnIndex` | `number` |

#### Returns

`boolean`

#### Overrides

[AreaModelTree](AreaModelTree.md).[isEditable](AreaModelTree.md#iseditable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:424](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L424)

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

[AreaModelTree](AreaModelTree.md).[isFilterable](AreaModelTree.md#isfilterable)

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

[AreaModelTree](AreaModelTree.md).[isRowCheckable](AreaModelTree.md#isrowcheckable)

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

[AreaModelTree](AreaModelTree.md).[isRowChecked](AreaModelTree.md#isrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L92)

___

### isRowHeaderCell

▸ **isRowHeaderCell**(`rowIndex`, `columnIndex`): `boolean`

True for the label cell of a row (the table gives it `role="rowheader"`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | index of the displayed body row |
| `columnIndex` | `number` | column index |

#### Returns

`boolean`

true for the group column

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:419](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L419)

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

[AreaModelTree](AreaModelTree.md).[isSelectable](AreaModelTree.md#isselectable)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L184)

___

### moveRows

▸ **moveRows**(`_rowIndices`, `_target`): `boolean`

Row drag: does nothing (see [canMoveRows](AreaModelPivot.md#canmoverows)).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_rowIndices` | `number`[] |
| `_target` | [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) |

#### Returns

`boolean`

always false

**`Since`**

1.1.95

#### Overrides

[AreaModelTree](AreaModelTree.md).[moveRows](AreaModelTree.md#moverows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:361](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L361)

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

[AreaModelTree](AreaModelTree.md).[readPropertyPath](AreaModelTree.md#readpropertypath)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:362](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L362)

___

### recalcVisibleTreeRows

▸ **recalcVisibleTreeRows**(`refilter?`): `void`

Rebuilds the displayed rows after the `expanded` state of rows has changed and applies the active filter
(see [externalFilterChanged](AreaModelTree.md#externalfilterchanged)) again. The table calls it on every expand/collapse click. Call it
yourself after changing `row.expanded` from code, then repaint with `tableApi.repaintHard()`
(the row count changes).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `refilter?` | `boolean` | `true` | run the filter function again (needed after the rows changed). `false` after a pure expand/collapse: whether a row matches does not depend on it (the table does this on every click – before, the filter ran over all nodes for each click). |

#### Returns

`void`

**`Example`**

```ts
// expand all first-level rows from code
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
for (const row of treeModel.rows) row.expanded = true;
treeModel.recalcVisibleTreeRows();
tableApi.repaintHard();
```

#### Inherited from

[AreaModelTree](AreaModelTree.md).[recalcVisibleTreeRows](AreaModelTree.md#recalcvisibletreerows)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L104)

___

### setAllParentsOk

▸ **setAllParentsOk**(`item`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |

#### Returns

`boolean`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[setAllParentsOk](AreaModelTree.md#setallparentsok)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:506](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L506)

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

[AreaModelTree](AreaModelTree.md).[setCalculatedValue](AreaModelTree.md#setcalculatedvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:325](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L325)

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

[AreaModelTree](AreaModelTree.md).[setPropertyValue](AreaModelTree.md#setpropertyvalue)

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

[AreaModelTree](AreaModelTree.md).[setRowChecked](AreaModelTree.md#setrowchecked)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L97)

___

### setValue

▸ **setValue**(`_rowIndex`, `_columnIndex`, `_value`): `boolean`

Pivot cells are computed – `setValue` does nothing (`false`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_rowIndex` | `number` |
| `_columnIndex` | `number` |
| `_value` | `any` |

#### Returns

`boolean`

#### Overrides

[AreaModelTree](AreaModelTree.md).[setValue](AreaModelTree.md#setvalue)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:429](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L429)

___

### sort

▸ **sort**(`compareFn`): `void`

Sorts the rows of every level with your function – it gets two [RowGroupIf](../interfaces/RowGroupIf.md) (siblings).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn` | (`a`: `any`, `b`: `any`) => `number` | compares two row groups |

#### Returns

`void`

**`Example`**

```ts
tableApi.sort((a: RowGroupIf, b: RowGroupIf) => b.count - a.count);   // most source rows first
```

#### Overrides

[AreaModelTree](AreaModelTree.md).[sort](AreaModelTree.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts:494](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-pivot.ts#L494)

___

### toggleExpandCollapseAll

▸ **toggleExpandCollapseAll**(`expanded`): `void`

Expands or collapses every row on every level and applies the active filter again.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `expanded` | `boolean` | `true` expands, `false` collapses all rows |

#### Returns

`void`

#### Inherited from

[AreaModelTree](AreaModelTree.md).[toggleExpandCollapseAll](AreaModelTree.md#toggleexpandcollapseall)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:501](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L501)
