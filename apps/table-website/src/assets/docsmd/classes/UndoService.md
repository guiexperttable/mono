[GuiExpert Table API](../README.md) / [Exports](../modules.md) / UndoService

# Class: UndoService

Undo and redo ([TableOptionsIf.undo](../interfaces/TableOptionsIf.md#undo), `tableScope.undoService`, only with the option): records every change
that goes through the table's one write path (editor, fill handle, paste, cut, Delete; `api.applyCellChanges` only
with `recordApiChanges` or `{ undoable: true }`) as one step, and marked values of a batch edit. Not recorded:
`updateCells`, `setRows` (the history is emptied when the rows array is replaced), sorting, filter, row drag.

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](UndoService.md#constructor)

### Properties

- [options](UndoService.md#options)

### Methods

- [addStep](UndoService.md#addstep)
- [batch](UndoService.md#batch)
- [beginFold](UndoService.md#beginfold)
- [canRedo](UndoService.md#canredo)
- [canUndo](UndoService.md#canundo)
- [clear](UndoService.md#clear)
- [endFold](UndoService.md#endfold)
- [getState](UndoService.md#getstate)
- [record](UndoService.md#record)
- [recordPending](UndoService.md#recordpending)
- [redo](UndoService.md#redo)
- [undo](UndoService.md#undo)

## Constructors

### constructor

• **new UndoService**(`tableScope`, `options`): [`UndoService`](UndoService.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) | the table |
| `options` | [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md) | complete options |

#### Returns

[`UndoService`](UndoService.md)

#### Defined in

[src/lib/table/undo/undo-service.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L76)

## Properties

### options

• `Readonly` **options**: [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)

complete options

#### Defined in

[src/lib/table/undo/undo-service.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L76)

## Methods

### addStep

▸ **addStep**(`step`): `void`

Records an own step (e.g. inserting rows) – not while an undo or redo runs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `step` | [`UndoableIf`](../interfaces/UndoableIf.md) | the step |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/undo/undo-service.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L86)

___

### batch

▸ **batch**\<`T`\>(`label`, `fn`): `T`

Records everything `fn` changes as one step (see [TableApi.batchUndoable](TableApi.md#batchundoable)).

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `label` | `string` | the label of the step |
| `fn` | () => `T` | the changes |

#### Returns

`T`

what `fn` returns

#### Defined in

[src/lib/table/undo/undo-service.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L164)

___

### beginFold

▸ **beginFold**(): `void`

The table reports the write that was just recorded (`onModelChanged`): writes of handlers until [endFold](UndoService.md#endfold)
belong to the same step.

#### Returns

`void`

#### Defined in

[src/lib/table/undo/undo-service.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L127)

___

### canRedo

▸ **canRedo**(): `boolean`

#### Returns

`boolean`

true if there is a step to redo

#### Defined in

[src/lib/table/undo/undo-service.ts:212](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L212)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

true if there is a step to undo

#### Defined in

[src/lib/table/undo/undo-service.ts:206](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L206)

___

### clear

▸ **clear**(`silent?`): `void`

Empties the history (batch commit/cancel, [TableApi.clearUndoHistory](TableApi.md#clearundohistory)).

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `silent` | `boolean` | `false` |

#### Returns

`void`

#### Defined in

[src/lib/table/undo/undo-service.ts:225](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L225)

___

### endFold

▸ **endFold**(): `void`

End of [beginFold](UndoService.md#beginfold).

#### Returns

`void`

#### Defined in

[src/lib/table/undo/undo-service.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L134)

___

### getState

▸ **getState**(): [`GeUndoEvent`](GeUndoEvent.md)

#### Returns

[`GeUndoEvent`](GeUndoEvent.md)

the state of the history (for buttons)

#### Defined in

[src/lib/table/undo/undo-service.ts:218](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L218)

___

### record

▸ **record**(`changes`, `source`, `undoable?`): `void`

Records written cells as a step (called by the table's write path).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | the written cells |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | what wrote them |
| `undoable?` | `boolean` | `api.applyCellChanges(…, { undoable })`: overrides `recordApiChanges` |

#### Returns

`void`

#### Defined in

[src/lib/table/undo/undo-service.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L99)

___

### recordPending

▸ **recordPending**(`cells`, `source`, `undoable?`): `void`

Records marked values of a batch edit as a step (called by the table).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | [`PendingSnapshotIf`](../interfaces/PendingSnapshotIf.md)[] | pending entries before and after |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | what marked them |
| `undoable?` | `boolean` | as in [record](UndoService.md#record) |

#### Returns

`void`

#### Defined in

[src/lib/table/undo/undo-service.ts:149](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L149)

___

### redo

▸ **redo**(): `boolean`

Redoes the last undone step (source `"redo"`).

#### Returns

`boolean`

true if a step was redone

#### Defined in

[src/lib/table/undo/undo-service.ts:201](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L201)

___

### undo

▸ **undo**(): `boolean`

Undoes the last step: writes the old values back (source `"undo"`), selects the cells, announces it.

#### Returns

`boolean`

true if a step was undone

#### Defined in

[src/lib/table/undo/undo-service.ts:192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-service.ts#L192)
