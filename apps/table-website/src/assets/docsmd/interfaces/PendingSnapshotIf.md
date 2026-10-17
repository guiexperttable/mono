[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PendingSnapshotIf

# Interface: PendingSnapshotIf

One cell of a batch edit step: its pending entry before and after (none = not pending).

## Table of contents

### Properties

- [after](PendingSnapshotIf.md#after)
- [before](PendingSnapshotIf.md#before)
- [property](PendingSnapshotIf.md#property)
- [rowKey](PendingSnapshotIf.md#rowkey)

## Properties

### after

• `Optional` **after**: [`PendingCellIf`](PendingCellIf.md)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L13)

___

### before

• `Optional` **before**: [`PendingCellIf`](PendingCellIf.md)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L12)

___

### property

• **property**: `string`

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L11)

___

### rowKey

• **rowKey**: `unknown`

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L10)
