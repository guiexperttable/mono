[GuiExpert Table API](../README.md) / [Exports](../modules.md) / UndoableIf

# Interface: UndoableIf

One step of the undo history (command pattern): what the user did as one action – an edit, a fill, a paste.

**`Since`**

1.1.99

## Implemented by

- [`CellChangesUndoable`](../classes/CellChangesUndoable.md)
- [`PendingChangesUndoable`](../classes/PendingChangesUndoable.md)

## Table of contents

### Properties

- [cellCount](UndoableIf.md#cellcount)
- [label](UndoableIf.md#label)
- [source](UndoableIf.md#source)

### Methods

- [redo](UndoableIf.md#redo)
- [undo](UndoableIf.md#undo)

## Properties

### cellCount

• `Readonly` **cellCount**: `number`

Cells the step holds (for `UndoOptionsIf.maxCells`).

#### Defined in

[src/lib/table/undo/undoable.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L32)

___

### label

• `Readonly` **label**: `string`

For buttons and announcements: `"Edit"`, `"Paste"`, `"Fill"` …

#### Defined in

[src/lib/table/undo/undoable.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L28)

___

### source

• `Readonly` **source**: [`CellChangeSource`](../modules.md#cellchangesource)

What started the step.

#### Defined in

[src/lib/table/undo/undoable.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L30)

## Methods

### redo

▸ **redo**(`scope`): [`UndoResultIf`](UndoResultIf.md)

Writes the new values again.

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](../classes/TableScope.md) |

#### Returns

[`UndoResultIf`](UndoResultIf.md)

#### Defined in

[src/lib/table/undo/undoable.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L36)

___

### undo

▸ **undo**(`scope`): [`UndoResultIf`](UndoResultIf.md)

Writes the old values back.

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](../classes/TableScope.md) |

#### Returns

[`UndoResultIf`](UndoResultIf.md)

#### Defined in

[src/lib/table/undo/undoable.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undoable.if.ts#L34)
