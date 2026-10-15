[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotColumnInfoIf

# Interface: PivotColumnInfoIf

What a value column of a pivot table shows ([AreaModelPivot.getColumnInfo](../classes/AreaModelPivot.md#getcolumninfo)): the values of one column key
(`"value"`), the subtotal of a column group (`"subtotal"`, with [PivotConfigIf.columnSubtotals](PivotConfigIf.md#columnsubtotals)) or the
total over all column keys (`"total"`).

**`Example`**

```ts
const info = pivotModel.getPivotBody().getColumnInfo(columnIndex);
if (info?.kind === "value") console.log(info.column?.path, info.value.name);   // ["Jan"], "sum(umsatz)"
```

**`Since`**

1.1.94

## Table of contents

### Properties

- [column](PivotColumnInfoIf.md#column)
- [kind](PivotColumnInfoIf.md#kind)
- [value](PivotColumnInfoIf.md#value)
- [valueIndex](PivotColumnInfoIf.md#valueindex)

## Properties

### column

• `Optional` `Readonly` **column**: [`RowGroupIf`](RowGroupIf.md)\<`any`\>

The column key (lowest level) or column group; undefined for the total.

#### Defined in

[src/lib/table/pivot/pivot-column-info.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-info.if.ts#L20)

___

### kind

• `Readonly` **kind**: ``"total"`` \| ``"value"`` \| ``"subtotal"``

`"value"` – one column key, `"subtotal"` – a column group, `"total"` – all columns.

#### Defined in

[src/lib/table/pivot/pivot-column-info.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-info.if.ts#L18)

___

### value

• `Readonly` **value**: [`PivotValueInfoIf`](PivotValueInfoIf.md)

The value shown in the column.

#### Defined in

[src/lib/table/pivot/pivot-column-info.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-info.if.ts#L22)

___

### valueIndex

• `Readonly` **valueIndex**: `number`

The index of the value in [PivotConfigIf.values](PivotConfigIf.md#values).

#### Defined in

[src/lib/table/pivot/pivot-column-info.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-info.if.ts#L24)
