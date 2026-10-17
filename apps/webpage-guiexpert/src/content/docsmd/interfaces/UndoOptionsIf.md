[GuiExpert Table API](../README.md) / [Exports](../modules.md) / UndoOptionsIf

# Interface: UndoOptionsIf

Undo and redo ([TableOptionsIf.undo](TableOptionsIf.md#undo)). `undo: true` uses the defaults of [UndoOptions](../classes/UndoOptions.md); an object
overrides single values.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  editing: true,
  undo: { maxSteps: 50, onConflict: "overwrite" },
};
```

**`Since`**

1.1.99

## Implemented by

- [`UndoOptions`](../classes/UndoOptions.md)

## Table of contents

### Properties

- [maxCells](UndoOptionsIf.md#maxcells)
- [maxSteps](UndoOptionsIf.md#maxsteps)
- [onConflict](UndoOptionsIf.md#onconflict)
- [recordApiChanges](UndoOptionsIf.md#recordapichanges)

## Properties

### maxCells

• **maxCells**: `number`

Cells kept over all steps (the oldest steps are dropped). A single change with more cells empties the history
and is announced – it cannot be undone. Default `1_000_000`.

#### Defined in

[src/lib/table/undo/undo-options.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.if.ts#L22)

___

### maxSteps

• **maxSteps**: `number`

Steps kept; the oldest is dropped. Default `100`.

#### Defined in

[src/lib/table/undo/undo-options.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.if.ts#L17)

___

### onConflict

• **onConflict**: ``"skip"`` \| ``"overwrite"``

A cell changed by something else since the step (live data, `updateCells`): `"skip"` leaves it and announces it
(default, safe), `"overwrite"` writes anyway.

#### Defined in

[src/lib/table/undo/undo-options.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.if.ts#L27)

___

### recordApiChanges

• **recordApiChanges**: `boolean`

Record `api.applyCellChanges(…)` with source `"api"` too. Default `false` (per call: `{ undoable: true }`).

#### Defined in

[src/lib/table/undo/undo-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-options.if.ts#L29)
