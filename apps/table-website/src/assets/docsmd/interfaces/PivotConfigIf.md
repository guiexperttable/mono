[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotConfigIf

# Interface: PivotConfigIf\<T\>

What a pivot table shows: the row fields (grouped like a row grouping), the column fields (their values become
columns) and the values (aggregated per row × column), plus subtotals and totals. Used by
[PivotFactory.createTableModel](../classes/PivotFactory.md#createtablemodel), [pivotRows](../modules.md#pivotrows) and [TableApi.setPivotConfig](../classes/TableApi.md#setpivotconfig).

Fields have the form of a row grouping level ([RowGroupField](../modules.md#rowgroupfield)): a property path, a function (e.g. the quarter
of a date) or [RowGroupFieldIf](RowGroupFieldIf.md) with `label`, `format` and `order` – `groupBy` of a row grouping works as
`rowFields`.

**`Example`**

```ts
const config: PivotConfigIf<Sale> = {
  rowFields: ["region", "produkt"],
  columnFields: [{ value: "monat", order: "insertion" }],   // Jan before Feb (order in the data)
  values: ["umsatz"],                                        // sum of umsatz
  emptyText: "–"
};
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Hierarchy

- **`PivotConfigIf`**

  ↳ [`PivotTableModelParaIf`](PivotTableModelParaIf.md)

## Table of contents

### Properties

- [columnFields](PivotConfigIf.md#columnfields)
- [columnSubtotals](PivotConfigIf.md#columnsubtotals)
- [emptyLabel](PivotConfigIf.md#emptylabel)
- [emptyText](PivotConfigIf.md#emptytext)
- [expanded](PivotConfigIf.md#expanded)
- [maxColumns](PivotConfigIf.md#maxcolumns)
- [rowFields](PivotConfigIf.md#rowfields)
- [subtotals](PivotConfigIf.md#subtotals)
- [totalColumn](PivotConfigIf.md#totalcolumn)
- [totalLabel](PivotConfigIf.md#totallabel)
- [totalRow](PivotConfigIf.md#totalrow)
- [values](PivotConfigIf.md#values)

## Properties

### columnFields

• `Optional` **columnFields**: [`RowGroupField`](../modules.md#rowgroupfield)\<`T`\>[]

The fields whose values become columns, top first. Several fields form a multi-row header. Default `[]` (totals only).

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L30)

___

### columnSubtotals

• `Optional` **columnSubtotals**: `boolean`

A total column behind every column group (e.g. "2026 Total" behind its quarters); the group gets a toggle and,
when collapsed, shows only its total. Default: true with two or more column fields.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L39)

___

### emptyLabel

• `Optional` **emptyLabel**: `string`

The label of empty keys (`null`, `undefined`, `""`) – rows and columns. Default `"(empty)"`.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L53)

___

### emptyText

• `Optional` **emptyText**: `string`

The text of a cell without data (the value stays `undefined`, not 0). Default `""`.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L55)

___

### expanded

• `Optional` **expanded**: [`RowGroupExpanded`](../modules.md#rowgroupexpanded)\<`T`\>

Expanded row groups: `true` (default), `false`, open levels as a number (`0` = all closed) or a function per group.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L51)

___

### maxColumns

• `Optional` **maxColumns**: `number`

The maximum number of column keys (of the lowest column level). More keys: the first ones are shown, a warning is
logged and [PivotResult.truncated](../classes/PivotResult.md#truncated) is true – total column, subtotal columns and total row still count all rows.
Default 1000.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L49)

___

### rowFields

• **rowFields**: [`RowGroupField`](../modules.md#rowgroupfield)\<`T`\>[]

The row levels, top first. Several levels form a hierarchy with subtotals. An empty list shows one total row.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L28)

___

### subtotals

• `Optional` **subtotals**: `boolean`

Show the aggregates in the group rows (subtotals). Default true.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L34)

___

### totalColumn

• `Optional` **totalColumn**: `boolean` \| ``"fixed"``

The total column(s) on the right: `"fixed"` (default, fixed on the right), `true` (last columns, scrolled) or `false`.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L41)

___

### totalLabel

• `Optional` **totalLabel**: `string`

The word for totals: header of the total column, label of the total row, suffix of subtotal columns. Default `"Total"`.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L57)

___

### totalRow

• `Optional` **totalRow**: `boolean`

The total row in the footer. Default true.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L43)

___

### values

• **values**: [`PivotValue`](../modules.md#pivotvalue)\<`T`\>[]

The aggregated values (at least one): `"umsatz"` (sum) or [PivotValueIf](PivotValueIf.md). With several values every column key gets one column per value.

#### Defined in

[src/lib/table/pivot/pivot-config.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-config.if.ts#L32)
