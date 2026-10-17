[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellChangesUndoable

# Class: CellChangesUndoable

A step of written cells (an edit, a fill, a paste …): undo writes the old values back, redo the new ones. The cells
are found by row **object** and property – sorting and filtering in between don't matter; a row a filter hides is
written directly into its object (reported in the same event), a row that left the model is skipped. A cell that
no longer has the expected value is skipped (`onConflict: "skip"`) or overwritten.

**`Since`**

1.1.99

## Implements

- [`UndoableIf`](../interfaces/UndoableIf.md)

## Table of contents

### Constructors

- [constructor](CellChangesUndoable.md#constructor)

### Properties

- [label](CellChangesUndoable.md#label)
- [source](CellChangesUndoable.md#source)

### Accessors

- [cellCount](CellChangesUndoable.md#cellcount)

### Methods

- [append](CellChangesUndoable.md#append)
- [redo](CellChangesUndoable.md#redo)
- [undo](CellChangesUndoable.md#undo)

## Constructors

### constructor

• **new CellChangesUndoable**(`label`, `source`, `changes`): [`CellChangesUndoable`](CellChangesUndoable.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `label` | `string` | for buttons and announcements |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | what started the step |
| `changes` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | the written cells (`GeModelChangeEvent.changes`) |

#### Returns

[`CellChangesUndoable`](CellChangesUndoable.md)

#### Defined in

[src/lib/table/undo/cell-changes-undoable.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L40)

## Properties

### label

• `Readonly` **label**: `string`

for buttons and announcements

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[label](../interfaces/UndoableIf.md#label)

#### Defined in

[src/lib/table/undo/cell-changes-undoable.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L40)

___

### source

• `Readonly` **source**: [`CellChangeSource`](../modules.md#cellchangesource)

what started the step

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[source](../interfaces/UndoableIf.md#source)

#### Defined in

[src/lib/table/undo/cell-changes-undoable.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L40)

## Accessors

### cellCount

• `get` **cellCount**(): `number`

Cells the step holds (for `UndoOptionsIf.maxCells`).

#### Returns

`number`

#### Implementation of

[UndoableIf](../interfaces/UndoableIf.md).[cellCount](../interfaces/UndoableIf.md#cellcount)

#### Defined in

[src/lib/table/undo/cell-changes-undoable.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L47)

## Methods

### append

▸ **append**(`changes`): `void`

Adds cells written by the same user action (an `onModelChanged` handler that derives values) to this step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | the written cells |

#### Returns

`void`

#### Defined in

[src/lib/table/undo/cell-changes-undoable.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L56)

___

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

[src/lib/table/undo/cell-changes-undoable.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L67)

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

[src/lib/table/undo/cell-changes-undoable.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/cell-changes-undoable.ts#L63)
