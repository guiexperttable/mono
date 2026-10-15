[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotTableModelParaIf

# Interface: PivotTableModelParaIf\<T\>

Parameters of [PivotFactory.createTableModel](../classes/PivotFactory.md#createtablemodel): the rows, the pivot ([PivotConfigIf](PivotConfigIf.md)) and the look of the
table.

**`Example`**

```ts
const para: PivotTableModelParaIf<Sale> = {
  rows: sales,
  rowFields: ["region", "produkt"],
  columnFields: [{ value: "monat", order: "insertion" }],
  values: ["umsatz"],
  emptyText: "–",
  valueColumnWidth: px80
};
const tableModel = PivotFactory.createTableModel(para);
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Hierarchy

- [`PivotConfigIf`](PivotConfigIf.md)\<`T`\>

  ↳ **`PivotTableModelParaIf`**

## Table of contents

### Properties

- [columnFields](PivotTableModelParaIf.md#columnfields)
- [columnSubtotals](PivotTableModelParaIf.md#columnsubtotals)
- [defaultRowHeights](PivotTableModelParaIf.md#defaultrowheights)
- [emptyLabel](PivotTableModelParaIf.md#emptylabel)
- [emptyText](PivotTableModelParaIf.md#emptytext)
- [expanded](PivotTableModelParaIf.md#expanded)
- [getSelectionModel](PivotTableModelParaIf.md#getselectionmodel)
- [groupColumn](PivotTableModelParaIf.md#groupcolumn)
- [maxColumns](PivotTableModelParaIf.md#maxcolumns)
- [rowFields](PivotTableModelParaIf.md#rowfields)
- [rowNumbersVisible](PivotTableModelParaIf.md#rownumbersvisible)
- [rows](PivotTableModelParaIf.md#rows)
- [subtotals](PivotTableModelParaIf.md#subtotals)
- [tableOptions](PivotTableModelParaIf.md#tableoptions)
- [totalColumn](PivotTableModelParaIf.md#totalcolumn)
- [totalLabel](PivotTableModelParaIf.md#totallabel)
- [totalRow](PivotTableModelParaIf.md#totalrow)
- [valueColumnWidth](PivotTableModelParaIf.md#valuecolumnwidth)
- [values](PivotTableModelParaIf.md#values)

## Properties

### columnFields

• `Optional` **columnFields**: [`RowGroupField`](../modules.md#rowgroupfield)\<`T`\>[]

The fields whose values become columns, top first. Several fields form a multi-row header. Default `[]` (totals only).

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[columnFields](PivotConfigIf.md#columnfields)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L30)

___

### columnSubtotals

• `Optional` **columnSubtotals**: `boolean`

A total column behind every column group (e.g. "2026 Total" behind its quarters); the group gets a toggle and,
when collapsed, shows only its total. Default: true with two or more column fields.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[columnSubtotals](PivotConfigIf.md#columnsubtotals)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L39)

___

### defaultRowHeights

• `Optional` **defaultRowHeights**: [`DefaultRowHeightsIf`](DefaultRowHeightsIf.md)

Row heights of header, body and footer. Default: `tableOptions.defaultRowHeights`.

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L41)

___

### emptyLabel

• `Optional` **emptyLabel**: `string`

The label of empty keys (`null`, `undefined`, `""`) – rows and columns. Default `"(empty)"`.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[emptyLabel](PivotConfigIf.md#emptylabel)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L53)

___

### emptyText

• `Optional` **emptyText**: `string`

The text of a cell without data (the value stays `undefined`, not 0). Default `""`.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[emptyText](PivotConfigIf.md#emptytext)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L55)

___

### expanded

• `Optional` **expanded**: [`RowGroupExpanded`](../modules.md#rowgroupexpanded)\<`T`\>

Expanded row groups: `true` (default), `false`, open levels as a number (`0` = all closed) or a function per group.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[expanded](PivotConfigIf.md#expanded)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L51)

___

### getSelectionModel

• `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](SelectionModelIf.md)\>

Selection model factory. Default: `tableOptions.getSelectionModel`.

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L43)

___

### groupColumn

• `Optional` **groupColumn**: `Partial`\<[`RowGroupColumnOptionsIf`](RowGroupColumnOptionsIf.md)\<`T`\>\>

The group column (arrows and row labels): header, width, `showCount` (default false), own label, fixed (default true).

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L33)

___

### maxColumns

• `Optional` **maxColumns**: `number`

The maximum number of column keys (of the lowest column level). More keys: the first ones are shown, a warning is
logged and [PivotResult.truncated](../classes/PivotResult.md#truncated) is true – total column, subtotal columns and total row still count all rows.
Default 1000.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[maxColumns](PivotConfigIf.md#maxcolumns)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L49)

___

### rowFields

• **rowFields**: [`RowGroupField`](../modules.md#rowgroupfield)\<`T`\>[]

The row levels, top first. Several levels form a hierarchy with subtotals. An empty list shows one total row.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[rowFields](PivotConfigIf.md#rowfields)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L28)

___

### rowNumbersVisible

• `Optional` **rowNumbersVisible**: `boolean` \| `Partial`\<[`RowNumberOptionsIf`](RowNumberOptionsIf.md)\>

Row numbers in front of the group column (counted per displayed row).

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L37)

___

### rows

• **rows**: `T`[]

The source rows (not changed).

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L31)

___

### subtotals

• `Optional` **subtotals**: `boolean`

Show the aggregates in the group rows (subtotals). Default true.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[subtotals](PivotConfigIf.md#subtotals)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L34)

___

### tableOptions

• `Optional` **tableOptions**: [`TableOptionsIf`](TableOptionsIf.md)

Options of the table (row heights, selection model …).

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L39)

___

### totalColumn

• `Optional` **totalColumn**: `boolean` \| ``"fixed"``

The total column(s) on the right: `"fixed"` (default, fixed on the right), `true` (last columns, scrolled) or `false`.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[totalColumn](PivotConfigIf.md#totalcolumn)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L41)

___

### totalLabel

• `Optional` **totalLabel**: `string`

The word for totals: header of the total column, label of the total row, suffix of subtotal columns. Default `"Total"`.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[totalLabel](PivotConfigIf.md#totallabel)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L57)

___

### totalRow

• `Optional` **totalRow**: `boolean`

The total row in the footer. Default true.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[totalRow](PivotConfigIf.md#totalrow)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L43)

___

### valueColumnWidth

• `Optional` **valueColumnWidth**: [`SizeIf`](SizeIf.md)

The width of a value column. Default 100 px.

#### Defined in

[src/lib/table/factory/pivot-table-model-para.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-table-model-para.if.ts#L35)

___

### values

• **values**: [`PivotValue`](../modules.md#pivotvalue)\<`T`\>[]

The aggregated values (at least one): `"umsatz"` (sum) or [PivotValueIf](PivotValueIf.md). With several values every column key gets one column per value.

#### Inherited from

[PivotConfigIf](PivotConfigIf.md).[values](PivotConfigIf.md#values)

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L32)
