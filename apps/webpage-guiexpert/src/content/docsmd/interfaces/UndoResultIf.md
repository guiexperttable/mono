[GuiExpert Table API](../README.md) / [Exports](../modules.md) / UndoResultIf

# Interface: UndoResultIf

What an undo or redo did.

**`Since`**

1.1.99

## Table of contents

### Properties

- [applied](UndoResultIf.md#applied)
- [range](UndoResultIf.md#range)
- [skipped](UndoResultIf.md#skipped)

## Properties

### applied

• `Readonly` **applied**: `number`

Cells written back.

#### Defined in

[src/lib/table/undo/undoable.if.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L13)

___

### range

• `Optional` `Readonly` **range**: [`CellRange`](../classes/CellRange.md)

The shown cells written back (display rows, model columns) – selected afterwards.

#### Defined in

[src/lib/table/undo/undoable.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L17)

___

### skipped

• `Readonly` **skipped**: `number`

Cells left out (row gone, no longer editable, changed by something else with `onConflict: "skip"`).

#### Defined in

[src/lib/table/undo/undoable.if.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L15)
