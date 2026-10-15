[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupTableModelParaIf

# Interface: RowGroupTableModelParaIf\<T\>

Parameters of [RowGroupFactory.createTableModel](../classes/RowGroupFactory.md#createtablemodel).

**`Example`**

```ts
const para: RowGroupTableModelParaIf<Sale> = {
  rows: sales,
  columnDefs,
  groupBy: ["region", "produkt"],
  aggregations: { umsatz: "sum" },
  expanded: 1                      // regions open, products closed
};
const tableModel = RowGroupFactory.createTableModel(para);
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Table of contents

### Properties

- [aggregations](RowGroupTableModelParaIf.md#aggregations)
- [columnDefs](RowGroupTableModelParaIf.md#columndefs)
- [defaultRowHeights](RowGroupTableModelParaIf.md#defaultrowheights)
- [emptyLabel](RowGroupTableModelParaIf.md#emptylabel)
- [expanded](RowGroupTableModelParaIf.md#expanded)
- [fixedLeftColumnCount](RowGroupTableModelParaIf.md#fixedleftcolumncount)
- [fixedRightColumnCount](RowGroupTableModelParaIf.md#fixedrightcolumncount)
- [footerAggregates](RowGroupTableModelParaIf.md#footeraggregates)
- [getSelectionModel](RowGroupTableModelParaIf.md#getselectionmodel)
- [groupBy](RowGroupTableModelParaIf.md#groupby)
- [groupColumn](RowGroupTableModelParaIf.md#groupcolumn)
- [hideGroupedColumns](RowGroupTableModelParaIf.md#hidegroupedcolumns)
- [rowCheckboxVisible](RowGroupTableModelParaIf.md#rowcheckboxvisible)
- [rowNumbersVisible](RowGroupTableModelParaIf.md#rownumbersvisible)
- [rows](RowGroupTableModelParaIf.md#rows)
- [tableOptions](RowGroupTableModelParaIf.md#tableoptions)

## Properties

### aggregations

• `Optional` **aggregations**: [`AggregateSpecMap`](../modules.md#aggregatespecmap)\<`T`\>

Aggregates in the group rows; the key is the property of the column (`{ umsatz: "sum" }`, see [AggregateSpecMap](../modules.md#aggregatespecmap)).

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L38)

___

### columnDefs

• `Optional` **columnDefs**: [`ColumnDefIf`](ColumnDefIf.md)[]

The columns. Default: one per key of the first row. The group column is added in front of them.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L36)

___

### defaultRowHeights

• `Optional` **defaultRowHeights**: [`DefaultRowHeightsIf`](DefaultRowHeightsIf.md)

Row heights of header, body and footer. Default: `tableOptions.defaultRowHeights`.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L63)

___

### emptyLabel

• `Optional` **emptyLabel**: `string`

The label of the group of empty keys (`null`, `undefined`, `""`). Default `"(empty)"`.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L51)

___

### expanded

• `Optional` **expanded**: [`RowGroupExpanded`](../modules.md#rowgroupexpanded)\<`T`\>

Expanded groups: `true` (default), `false`, open levels as a number (`0` = all closed) or a function per group.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L49)

___

### fixedLeftColumnCount

• `Optional` **fixedLeftColumnCount**: `number`

Columns fixed on the left besides the group column (which is fixed by itself). Default 0.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L55)

___

### fixedRightColumnCount

• `Optional` **fixedRightColumnCount**: `number`

Columns fixed on the right. Default 0.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L57)

___

### footerAggregates

• `Optional` **footerAggregates**: `boolean` \| [`AggregateFooterConfig`](../modules.md#aggregatefooterconfig)\<`T`\>

The total row: `true` = the `aggregations`, `false` = none, or an own configuration ([AggregateFooterConfig](../modules.md#aggregatefooterconfig)).
Default: `true` if there are aggregations.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L43)

___

### getSelectionModel

• `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](SelectionModelIf.md)\>

Selection model factory. Default: `tableOptions.getSelectionModel`.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L65)

___

### groupBy

• **groupBy**: [`RowGroupField`](../modules.md#rowgroupfield)\<`T`\>[]

The levels, top first: property paths (`"region"`), functions (`o => o.date.getFullYear()`) or [RowGroupFieldIf](RowGroupFieldIf.md).

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L34)

___

### groupColumn

• `Optional` **groupColumn**: `Partial`\<[`RowGroupColumnOptionsIf`](RowGroupColumnOptionsIf.md)\<`T`\>\>

The group column: header, width, count, own label, fixed.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L45)

___

### hideGroupedColumns

• `Optional` **hideGroupedColumns**: `boolean`

Hide the columns of the grouped properties. Default true.

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L47)

___

### rowCheckboxVisible

• `Optional` **rowCheckboxVisible**: `boolean`

Set with a [CheckboxColumnDef](../classes/CheckboxColumnDef.md) in `columnDefs` (default: detected).

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L61)

___

### rowNumbersVisible

• `Optional` **rowNumbersVisible**: `boolean` \| `Partial`\<[`RowNumberOptionsIf`](RowNumberOptionsIf.md)\>

Row numbers in front of all columns (counted per displayed row, group rows included).

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L59)

___

### rows

• **rows**: `T`[]

The flat rows (not changed).

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L32)

___

### tableOptions

• `Optional` **tableOptions**: [`TableOptionsIf`](TableOptionsIf.md)

Options of the table (row heights, selection model, filter …).

#### Defined in

[src/lib/table/factory/row-group-table-model-para.if.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-table-model-para.if.ts#L53)
