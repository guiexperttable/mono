[GuiExpert Table API](../README.md) / [Exports](../modules.md) / UndoOptions

# Class: UndoOptions

The defaults of [UndoOptionsIf](../interfaces/UndoOptionsIf.md) (undo and redo, [TableOptionsIf.undo](../interfaces/TableOptionsIf.md#undo)).

**`Example`**

```ts
const options = UndoOptions.create({ maxSteps: 20 });
options?.onConflict;   // "skip"
```

**`Since`**

1.1.99

## Implements

- [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)

## Table of contents

### Constructors

- [constructor](UndoOptions.md#constructor)

### Properties

- [maxCells](UndoOptions.md#maxcells)
- [maxSteps](UndoOptions.md#maxsteps)
- [onConflict](UndoOptions.md#onconflict)
- [recordApiChanges](UndoOptions.md#recordapichanges)

### Methods

- [create](UndoOptions.md#create)

## Constructors

### constructor

• **new UndoOptions**(): [`UndoOptions`](UndoOptions.md)

#### Returns

[`UndoOptions`](UndoOptions.md)

## Properties

### maxCells

• **maxCells**: `number` = `1_000_000`

Cells kept over all steps (the oldest steps are dropped). A single change with more cells empties the history
and is announced – it cannot be undone. Default `1_000_000`.

#### Implementation of

[UndoOptionsIf](../interfaces/UndoOptionsIf.md).[maxCells](../interfaces/UndoOptionsIf.md#maxcells)

#### Defined in

[src/lib/table/undo/undo-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.ts#L15)

___

### maxSteps

• **maxSteps**: `number` = `100`

Steps kept; the oldest is dropped. Default `100`.

#### Implementation of

[UndoOptionsIf](../interfaces/UndoOptionsIf.md).[maxSteps](../interfaces/UndoOptionsIf.md#maxsteps)

#### Defined in

[src/lib/table/undo/undo-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.ts#L14)

___

### onConflict

• **onConflict**: ``"skip"`` \| ``"overwrite"`` = `"skip"`

A cell changed by something else since the step (live data, `updateCells`): `"skip"` leaves it and announces it
(default, safe), `"overwrite"` writes anyway.

#### Implementation of

[UndoOptionsIf](../interfaces/UndoOptionsIf.md).[onConflict](../interfaces/UndoOptionsIf.md#onconflict)

#### Defined in

[src/lib/table/undo/undo-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.ts#L16)

___

### recordApiChanges

• **recordApiChanges**: `boolean` = `false`

Record `api.applyCellChanges(…)` with source `"api"` too. Default `false` (per call: `{ undoable: true }`).

#### Implementation of

[UndoOptionsIf](../interfaces/UndoOptionsIf.md).[recordApiChanges](../interfaces/UndoOptionsIf.md#recordapichanges)

#### Defined in

[src/lib/table/undo/undo-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.ts#L17)

## Methods

### create

▸ **create**(`option?`): `undefined` \| [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)

The options of [TableOptionsIf.undo](../interfaces/TableOptionsIf.md#undo): `undefined`/`false` = off, `true` = the defaults, an object = the
defaults overridden by its values (`undefined` keeps the default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)\> | `tableOptions.undo` |

#### Returns

`undefined` \| [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)

complete options, `undefined` if undo is off

#### Defined in

[src/lib/table/undo/undo-options.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.ts#L26)
