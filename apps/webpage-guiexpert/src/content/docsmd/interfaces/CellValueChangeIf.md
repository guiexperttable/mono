[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellValueChangeIf

# Interface: CellValueChangeIf

A value to write into a body cell – the input of [TableApi.applyCellChanges](../classes/TableApi.md#applycellchanges) (and of the fill handle).

**`Example`**

```ts
const change: CellValueChangeIf = { rowIndex: 3, column: "price", value: 9.9 };
tableApi.applyCellChanges([change]);
```

**`Since`**

1.1.96

## Table of contents

### Properties

- [column](CellValueChangeIf.md#column)
- [rowIndex](CellValueChangeIf.md#rowindex)
- [value](CellValueChangeIf.md#value)

## Properties

### column

• **column**: `string` \| `number`

Model index of the column, or its property.

#### Defined in

[src/lib/table/batch-edit/cell-value-change.if.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-value-change.if.ts#L15)

___

### rowIndex

• **rowIndex**: `number`

Display index of the row in the body.

#### Defined in

[src/lib/table/batch-edit/cell-value-change.if.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-value-change.if.ts#L13)

___

### value

• **value**: `unknown`

The new value – like typed into the editor: it runs through the column's `editInputPipe`.

#### Defined in

[src/lib/table/batch-edit/cell-value-change.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-value-change.if.ts#L17)
