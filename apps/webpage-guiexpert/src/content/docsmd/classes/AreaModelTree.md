[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaModelTree

# Class: AreaModelTree\<S\>

Represents a  tree-based table model.
Extends the AbstractAreaModel class.

The displayed rows always come from one pipeline: all tree rows (in their current, possibly sorted order)
→ rows whose parents are all expanded → active filter. Everything that changes one of these inputs
([recalcVisibleTreeRows](AreaModelTree.md#recalcvisibletreerows) after an expand/collapse, [externalFilterChanged](AreaModelTree.md#externalfilterchanged), [doSort](AreaModelTree.md#dosort),
[toggleExpandCollapseAll](AreaModelTree.md#toggleexpandcollapseall)) runs the whole pipeline, so a filter survives expanding, collapsing and sorting.

Filter semantics: the filter function receives the [tree row](../interfaces/TreeRowIf.md) – your object is `row.data`.
It is called for **every** row, also for rows below collapsed parents. A row is shown if it or one of its
descendants matches (`row.keep`) and all its parents are expanded. So a match below a collapsed node keeps
that node visible (still collapsed); expanding it reveals the path to the match. The children of a matching
row are not kept automatically.

**`Example`**

```ts
// a tree table with a live search over the labels
const filter = { text: "" };
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  externalFilterFunction: (row: TreeRowIf<OrderNode>) => row.data.label.toLowerCase().includes(filter.text)
};
const rows = TreeFactory.buildTreeRows<OrderNode>(nodes, { expanded: false });
const tableModel = TableFactory.createTableModel({ rows, columnDefs, tableOptions });
searchInput.addEventListener("input", () => {
  filter.text = searchInput.value.toLowerCase();
  tableApi.externalFilterChanged(); // parents of matches stay visible; expanding and sorting keep the filter
});
```

## Type parameters

| Name | Description |
| :------ | :------ |
| `S` | The type of the row data. |

## Hierarchy

- [`AbstractAreaModel`](AbstractAreaModel.md)\<[`TreeRow`](TreeRow.md)\<`S`\>\>

  ↳ **`AreaModelTree`**

  ↳↳ [`AreaModelRowGroups`](AreaModelRowGroups.md)

  ↳↳ [`AreaModelPivot`](AreaModelPivot.md)

## Table of contents

### Constructors

- [constructor](AreaModelTree.md#constructor)

### Properties

- [areaIdent](AreaModelTree.md#areaident)
- [cellRenderers](AreaModelTree.md#cellrenderers)
- [columnDefs](AreaModelTree.md#columndefs)
- [defaultEditable](AreaModelTree.md#defaulteditable)
- [defaultRowHeight](AreaModelTree.md#defaultrowheight)
- [properties](AreaModelTree.md#properties)
- [rowSelectionModel](AreaModelTree.md#rowselectionmodel)
- [rows](AreaModelTree.md#rows)
- [type](AreaModelTree.md#type)
- [yPositions](AreaModelTree.md#ypositions)

### Methods

- [addCalculatedClasses](AreaModelTree.md#addcalculatedclasses)
- [applyShowValuesAs](AreaModelTree.md#applyshowvaluesas)
- [arrayMove](AreaModelTree.md#arraymove)
- [canMoveRows](AreaModelTree.md#canmoverows)
- [changeColumnOrder](AreaModelTree.md#changecolumnorder)
- [doSort](AreaModelTree.md#dosort)
- [externalFilterChanged](AreaModelTree.md#externalfilterchanged)
- [genericTreeTableSortComparator](AreaModelTree.md#generictreetablesortcomparator)
- [getAggregationSourceForValues](AreaModelTree.md#getaggregationsourceforvalues)
- [getCalculatedRenderer](AreaModelTree.md#getcalculatedrenderer)
- [getCalculatedText](AreaModelTree.md#getcalculatedtext)
- [getCellRenderer](AreaModelTree.md#getcellrenderer)
- [getColspanAt](AreaModelTree.md#getcolspanat)
- [getConstantRowHeight](AreaModelTree.md#getconstantrowheight)
- [getCustomClassesAt](AreaModelTree.md#getcustomclassesat)
- [getCustomStyleAt](AreaModelTree.md#getcustomstyleat)
- [getDisplayedChildren](AreaModelTree.md#getdisplayedchildren)
- [getDisplayedRootRows](AreaModelTree.md#getdisplayedrootrows)
- [getFilteredFlattenRows](AreaModelTree.md#getfilteredflattenrows)
- [getLeafRows](AreaModelTree.md#getleafrows)
- [getMaxColspan](AreaModelTree.md#getmaxcolspan)
- [getMaxRowspan](AreaModelTree.md#getmaxrowspan)
- [getRawValueOfRow](AreaModelTree.md#getrawvalueofrow)
- [getRowByIndex](AreaModelTree.md#getrowbyindex)
- [getRowCount](AreaModelTree.md#getrowcount)
- [getRowHeight](AreaModelTree.md#getrowheight)
- [getRowValue](AreaModelTree.md#getrowvalue)
- [getRowspanAt](AreaModelTree.md#getrowspanat)
- [getTextValueAt](AreaModelTree.md#gettextvalueat)
- [getTooltipAt](AreaModelTree.md#gettooltipat)
- [getUnfilteredRowCount](AreaModelTree.md#getunfilteredrowcount)
- [getValueAt](AreaModelTree.md#getvalueat)
- [getValueByT](AreaModelTree.md#getvaluebyt)
- [getYPosByRowIndex](AreaModelTree.md#getyposbyrowindex)
- [hasDerivedColumns](AreaModelTree.md#hasderivedcolumns)
- [hasDisplayedChildren](AreaModelTree.md#hasdisplayedchildren)
- [init](AreaModelTree.md#init)
- [invalidateColumnValues](AreaModelTree.md#invalidatecolumnvalues)
- [invalidateDerivedValues](AreaModelTree.md#invalidatederivedvalues)
- [isCalculatedProperty](AreaModelTree.md#iscalculatedproperty)
- [isDerivedProperty](AreaModelTree.md#isderivedproperty)
- [isEditable](AreaModelTree.md#iseditable)
- [isFilterable](AreaModelTree.md#isfilterable)
- [isRowCheckable](AreaModelTree.md#isrowcheckable)
- [isRowChecked](AreaModelTree.md#isrowchecked)
- [isSelectable](AreaModelTree.md#isselectable)
- [moveRows](AreaModelTree.md#moverows)
- [readPropertyPath](AreaModelTree.md#readpropertypath)
- [recalcVisibleTreeRows](AreaModelTree.md#recalcvisibletreerows)
- [setAllParentsOk](AreaModelTree.md#setallparentsok)
- [setCalculatedValue](AreaModelTree.md#setcalculatedvalue)
- [setPropertyValue](AreaModelTree.md#setpropertyvalue)
- [setRowChecked](AreaModelTree.md#setrowchecked)
- [setValue](AreaModelTree.md#setvalue)
- [sort](AreaModelTree.md#sort)
- [toggleExpandCollapseAll](AreaModelTree.md#toggleexpandcollapseall)

## Constructors

### constructor

• **new AreaModelTree**\<`S`\>(`areaIdent`, `rows`, `defaultRowHeight`, `columnDefs?`): [`AreaModelTree`](AreaModelTree.md)\<`S`\>

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` |
| `rows` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[] | `undefined` |
| `defaultRowHeight` | `number` | `undefined` |
| `columnDefs` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] | `[]` |

#### Returns

[`AreaModelTree`](AreaModelTree.md)\<`S`\>

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[constructor](AbstractAreaModel.md#constructor)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L70)

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

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L71)

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

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L74)

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

• **defaultRowHeight**: `number`

#### Inherited from

[AbstractAreaModel](AbstractAreaModel.md).[defaultRowHeight](AbstractAreaModel.md#defaultrowheight)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L73)

___

### properties

• `Protected` `Readonly` **properties**: `string`[]

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

[AbstractAreaModel](AbstractAreaModel.md).[rowSelectionModel](AbstractAreaModel.md#rowselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L22)

___

### rows

• `Readonly` **rows**: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L72)

___

### type

• **type**: `string` = `'AreaModelTree'`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L53)

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

### applyShowValuesAs

▸ **applyShowValuesAs**(`row`, `property`, `value`, `options`): `unknown`

„Show values as“ of one tree row: percentages of the column total relate to the (filtered) leaf rows,
`percentOfParentTotal`, `runningTotal`, `differenceFromPrevious` and `rank` to the displayed siblings.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\> |
| `property` | `string` |
| `value` | `unknown` |
| `options` | [`ShowValuesAsIf`](../interfaces/ShowValuesAsIf.md) |

#### Returns

`unknown`

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

[AbstractAreaModel](AbstractAreaModel.md).[arrayMove](AbstractAreaModel.md#arraymove)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:208](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L208)

___

### canMoveRows

▸ **canMoveRows**(`rowIndices`, `target`): `boolean`

Row drag: true if the rows can be moved to the target – no filter hides a displayed row, and the target is none of
the dragged rows and no descendant of them (no cycle). `"before"` / `"after"` = sibling of the target row,
`"inside"` = last child.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndices` | `number`[] | display indices of the dragged rows |
| `target` | [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) | the drop target |

#### Returns

`boolean`

true if [moveRows](AreaModelTree.md#moverows) would move them

**`Example`**

```ts
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
treeModel.canMoveRows([0], { rowIndex: 1, position: "inside" });   // false if row 1 is a child of row 0
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:211](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L211)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[changeColumnOrder](AbstractAreaModel.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L81)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the rows of every level (children stay below their parent) and keeps the active filter. The first sort
item is the primary key, the following ones break ties. The `rows` array and the children arrays are reordered
in place, so the order survives expanding, collapsing and filtering. Sort state `""` keeps the current order.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | primary key first; an empty list does nothing |

#### Returns

`boolean`

`true` if the rows were sorted, `false` for an empty list

**`Example`**

```ts
tableModel.getBodyModel().doSort([new SortItem(1, "desc")]);
tableApi.repaint();
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[doSort](AbstractAreaModel.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:458](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L458)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`S`\>(`predictFn`): `void`

Filters the tree; the function is remembered and applied again on every expand/collapse
([recalcVisibleTreeRows](AreaModelTree.md#recalcvisibletreerows)), [toggleExpandCollapseAll](AreaModelTree.md#toggleexpandcollapseall) and [doSort](AreaModelTree.md#dosort).

The function is called once for **every** tree row in depth-first order – also for rows below collapsed
parents – with the [tree row](../interfaces/TreeRowIf.md) (not your object: use `row.data`), the index of the row in
this depth-first list and the list itself. Shown are the rows that match or have a matching descendant
(`row.keep = true`) and whose parents are all expanded. A match below a collapsed node therefore keeps the
collapsed node visible. Usually called by `tableApi.externalFilterChanged()` with
`tableOptions.externalFilterFunction`.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`S`\> | returns a truthy value for the rows to show |

#### Returns

`void`

**`Example`**

```ts
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
treeModel.externalFilterChanged((row: TreeRowIf<OrderNode>) => row.data.total > 1000);
tableApi.repaintHard();

// remove the filter
treeModel.externalFilterChanged(() => true);
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[externalFilterChanged](AbstractAreaModel.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:439](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L439)

___

### genericTreeTableSortComparator

▸ **genericTreeTableSortComparator**(`property`, `f`): (`a`: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>, `b`: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>) => `number`

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
| `a` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\> |
| `b` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\> |

##### Returns

`number`

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getAggregationSourceForValues](AbstractAreaModel.md#getaggregationsourceforvalues)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:369](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L369)

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

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:304](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L304)

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

All rows share `defaultRowHeight` – unless a subclass overrides `getRowHeight()`, then row heights may
vary and `undefined` is returned.

#### Returns

`undefined` \| `number`

The constant row height or `undefined`.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:387](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L387)

___

### getCustomClassesAt

▸ **getCustomClassesAt**(`rowIndex`, `_columnIndex`): `string`[]

Returns an array of CSS class names to apply to the cell at the specified row and column indices.
This method allows for custom styling of individual cells.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row |
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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getCustomClassesAt](AbstractAreaModel.md#getcustomclassesat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:392](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L392)

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

### getDisplayedChildren

▸ **getDisplayedChildren**(`row`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

The displayed children of a row (in display order): all children, with an active filter only those that match
(or have a matching descendant). They are on screen if the row is expanded.
Used for the screen reader attributes `aria-setsize` / `aria-posinset` of tree rows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\> | a tree row of this model |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

the displayed children (empty for a leaf)

**`Example`**

```ts
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
const shown = treeModel.getDisplayedChildren(treeModel.rows[0]).length;
```

**`Since`**

1.1.91

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L145)

___

### getDisplayedRootRows

▸ **getDisplayedRootRows**(): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

The displayed top-level rows: all of [rows](AreaModelTree.md#rows), with an active filter only the matching ones (or with a
matching descendant).

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

the top-level rows that are shown

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L114)

___

### getFilteredFlattenRows

▸ **getFilteredFlattenRows**(): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

The displayed rows: all parents expanded and accepted by the active filter, in display order.

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

the displayed tree rows (do not modify the array)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L176)

___

### getLeafRows

▸ **getLeafRows**(`filtered?`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

The leaves (rows without children) of the whole tree, depth-first in the current order – independent of the
expanded state. Used for totals: collapsing a node does not change them, and parent rows are not counted twice.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filtered?` | `boolean` | `true` | only the leaves the active filter keeps (`externalFilterChanged`); `false`: all |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>[]

a new array

**`Example`**

```ts
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
const total = aggregate(treeModel.getLeafRows(), row => row.data.total, "sum");
```

**`Since`**

1.1.94

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

### getRawValueOfRow

▸ **getRawValueOfRow**(`row`, `prop`): `any`

The value of a tree row for a property – before „Show values as“: the computed value of a calculated column,
otherwise the property (path) of `row.data`. Subclasses (row groups) return their aggregates for group rows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\> | the tree row |
| `prop` | `string` | the property of the column |

#### Returns

`any`

the raw value

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:279](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L279)

___

### getRowByIndex

▸ **getRowByIndex**(`idx`): `undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>

Returns the row object at the specified index.
This method provides access to the underlying data structure.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `idx` | `number` | The index of the row |

#### Returns

`undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowByIndex](AbstractAreaModel.md#getrowbyindex)

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

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[getRowCount](AbstractAreaModel.md#getrowcount)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L180)

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

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:298](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L298)

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

[AbstractAreaModel](AbstractAreaModel.md).[getValueAt](AbstractAreaModel.md#getvalueat)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:257](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L257)

___

### getValueByT

▸ **getValueByT**(`t`, `property`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `t` | `S` |
| `property` | `string` |

#### Returns

`any`

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

### hasDisplayedChildren

▸ **hasDisplayedChildren**(`row`): `boolean`

True if the row has children that are shown when it is expanded – with an active filter only children that
match (or have a matching descendant) count. The arrow of a row without such children is hidden.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\> | a tree row of this model |

#### Returns

`boolean`

true if the row has displayed children

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

[AbstractAreaModel](AbstractAreaModel.md).[init](AbstractAreaModel.md#init)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/abstract-area-model.ts#L121)

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

### invalidateDerivedValues

▸ **invalidateDerivedValues**(`_change?`): `void`

Drops derived values: cached aggregates of formulas and „Show values as“ (called by the table on filter,
sorting, editing, `updateCells` and `api.repaint()`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_change?` | [`DerivedValuesChangeIf`](../interfaces/DerivedValuesChangeIf.md) | the changed rows (not used here) |

#### Returns

`void`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:325](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L325)

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

### moveRows

▸ **moveRows**(`rowIndices`, `target`): `boolean`

Row drag: moves tree rows (with their children) in front of / behind the target row (siblings) or into it
(`"inside"`: last children, the target is expanded) – in place in [rows](AreaModelTree.md#rows) and the `children` arrays;
`parent` and `deep` follow. See [canMoveRows](AreaModelTree.md#canmoverows).

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
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
treeModel.moveRows([3], { rowIndex: 0, position: "inside" });
tableApi.repaintHard();   // or simply tableApi.moveRows([3], { rowIndex: 0, position: "inside" })
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:235](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L235)

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

[AbstractAreaModel](AbstractAreaModel.md).[setCalculatedValue](AbstractAreaModel.md#setcalculatedvalue)

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

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:514](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L514)

___

### sort

▸ **sort**(`compareFn`): `void`

Sorts the rows of every level with your own function (children stay below their parent) and keeps the active
filter. Used by `tableApi.sort(fn)` – before, sorting a tree with a function did nothing.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn` | (`a`: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>, `b`: [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`S`\>) => `number` | compares two sibling rows – like the filter function it gets the tree rows: your objects are `a.data` / `b.data` |

#### Returns

`void`

**`Example`**

```ts
tableApi.sort((a, b) => a.data.total - b.data.total);   // sorts the siblings of every level by total
```

#### Overrides

[AbstractAreaModel](AbstractAreaModel.md).[sort](AbstractAreaModel.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:490](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L490)

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

#### Defined in

[src/lib/table/data/tablemodel/areamodel/area-model-tree.ts:501](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/area-model-tree.ts#L501)
