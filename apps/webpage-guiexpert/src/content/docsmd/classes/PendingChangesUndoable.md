[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PendingChangesUndoable

# Class: PendingChangesUndoable

A step of a batch edit (values marked, not written): undo restores the pending state before the step, redo the one
after it. A cell whose pending value changed since then is skipped (`onConflict: "skip"`). Commit and cancel of the
batch edit empty the history.

**`Since`**

1.1.99

## Implements

- [`UndoableIf`](../interfaces/UndoableIf.md)

## Table of contents

### Constructors

- [constructor](PendingChangesUndoable.md#constructor)

### Properties

- [label](PendingChangesUndoable.md#label)
- [source](PendingChangesUndoable.md#source)

### Accessors

- [cellCount](PendingChangesUndoable.md#cellcount)

### Methods

- [redo](PendingChangesUndoable.md#redo)
- [undo](PendingChangesUndoable.md#undo)

## Constructors

### constructor

• **new PendingChangesUndoable**(`label`, `source`, `cells`): [`PendingChangesUndoable`](PendingChangesUndoable.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `label` | `string` | for buttons and announcements |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | what started the step |
| `cells` | [`PendingSnapshotIf`](../interfaces/PendingSnapshotIf.md)[] | the pending entries before and after |

#### Returns

[`PendingChangesUndoable`](PendingChangesUndoable.md)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L31)

## Properties

### label

• `Readonly` **label**: `string`

for buttons and announcements

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[label](../interfaces/UndoableIf.md#label)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L31)

___

### source

• `Readonly` **source**: [`CellChangeSource`](../modules.md#cellchangesource)

what started the step

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[source](../interfaces/UndoableIf.md#source)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L31)

## Accessors

### cellCount

• `get` **cellCount**(): `number`

Cells the step holds (for `UndoOptionsIf.maxCells`).

#### Returns

`number`

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[cellCount](../interfaces/UndoableIf.md#cellcount)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L34)

## Methods

### redo

▸ **redo**(`scope`): [`UndoResultIf`](../interfaces/UndoResultIf.md)

Writes the new values again.

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |

#### Returns

[`UndoResultIf`](../interfaces/UndoResultIf.md)

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[redo](../interfaces/UndoableIf.md#redo)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L42)

___

### undo

▸ **undo**(`scope`): [`UndoResultIf`](../interfaces/UndoResultIf.md)

Writes the old values back.

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |

#### Returns

[`UndoResultIf`](../interfaces/UndoResultIf.md)

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[undo](../interfaces/UndoableIf.md#undo)

#### Defined in

[src/lib/table/undo/pending-changes-undoable.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/pending-changes-undoable.ts#L38)
