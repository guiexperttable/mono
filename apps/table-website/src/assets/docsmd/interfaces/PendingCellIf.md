[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PendingCellIf

# Interface: PendingCellIf

One pending (not yet written) cell value of a batch edit – an entry of [PendingCellChanges](../classes/PendingCellChanges.md).

**`Since`**

1.1.96

## Table of contents

### Properties

- [error](PendingCellIf.md#error)
- [newValue](PendingCellIf.md#newvalue)
- [oldValue](PendingCellIf.md#oldvalue)
- [property](PendingCellIf.md#property)
- [rawValue](PendingCellIf.md#rawvalue)
- [rowKey](PendingCellIf.md#rowkey)

## Properties

### error

• `Optional` **error**: `string`

The message of [ColumnDefIf.validate](ColumnDefIf.md#validate), if the value is invalid.

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L19)

___

### newValue

• **newValue**: `unknown`

The value shown (after the column's `editInputPipe`).

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L15)

___

### oldValue

• **oldValue**: `unknown`

The value before the first change.

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L13)

___

### property

• **property**: `string`

The property of the column (`"#3"` for a column without property).

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L11)

___

### rawValue

• **rawValue**: `unknown`

The value as entered (written with `setValue` on commit – the pipe runs there once).

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L17)

___

### rowKey

• **rowKey**: `unknown`

The key of the row: the row object (tree: the data of the `TreeRow`), or the row index for models without objects.

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L9)
