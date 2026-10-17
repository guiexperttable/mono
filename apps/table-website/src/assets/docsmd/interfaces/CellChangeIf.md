[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellChangeIf

# Interface: CellChangeIf\<T\>

One changed cell: row, column, old and new value – the unit of a change set ([GeModelChangeEvent.changes](../classes/GeModelChangeEvent.md#changes),
[TableApi.getPendingChanges](../classes/TableApi.md#getpendingchanges)). With old **and** new value it is enough for undo and redo.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onModelChanged = (evt: GeModelChangeEvent) => {
  for (const change of evt.changes ?? []) {
    console.log(change.property, change.oldValue, "→", change.newValue, change.row);
  }
};
```

**`Since`**

1.1.96

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Properties

- [columnIndex](CellChangeIf.md#columnindex)
- [error](CellChangeIf.md#error)
- [newValue](CellChangeIf.md#newvalue)
- [oldValue](CellChangeIf.md#oldvalue)
- [property](CellChangeIf.md#property)
- [row](CellChangeIf.md#row)
- [rowIndex](CellChangeIf.md#rowindex)

## Properties

### columnIndex

• **columnIndex**: `number`

Model index of the column when the change was reported, `-1` if the column no longer exists.

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L36)

___

### error

• `Optional` **error**: `string`

Batch edit: the message of [ColumnDefIf.validate](ColumnDefIf.md#validate) if the new value is invalid.

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L44)

___

### newValue

• **newValue**: `unknown`

The new value (after the column's `editInputPipe`).

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L42)

___

### oldValue

• **oldValue**: `unknown`

The value before the change (batch edit: before the first change of the cell).

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L40)

___

### property

• **property**: `string`

The property of the column (`"#3"` for a column without property).

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L38)

___

### row

• **row**: `T`

The row object (tree: the data of the `TreeRow`); `undefined` for own area models without row objects.

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L32)

___

### rowIndex

• **rowIndex**: `number`

Display index of the row when the change was reported, `-1` if a filter hides the row.

#### Defined in

[src/lib/table/batch-edit/cell-change.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/cell-change.if.ts#L34)
