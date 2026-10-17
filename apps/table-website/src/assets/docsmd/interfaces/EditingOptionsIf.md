[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EditingOptionsIf

# Interface: EditingOptionsIf

Excel-style editing ([TableOptionsIf.editing](TableOptionsIf.md#editing)): what typing, Enter, Tab, the arrow keys and Delete do.
`editing: true` uses the defaults of [EditingOptions](../classes/EditingOptions.md); an object overrides single values.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel,           // new SelectionModel("range", "multi")
  editing: { enterKey: "moveDown", textSelection: "end" },   // Enter moves down like Excel
};
```

**`Since`**

1.1.99

## Implemented by

- [`EditingOptions`](../classes/EditingOptions.md)

## Table of contents

### Properties

- [arrowKeysCommit](EditingOptionsIf.md#arrowkeyscommit)
- [clearKeys](EditingOptionsIf.md#clearkeys)
- [collapseSelectionOnNavigate](EditingOptionsIf.md#collapseselectiononnavigate)
- [ctrlEnterFillsSelection](EditingOptionsIf.md#ctrlenterfillsselection)
- [defaultEditable](EditingOptionsIf.md#defaulteditable)
- [emptyValue](EditingOptionsIf.md#emptyvalue)
- [enterKey](EditingOptionsIf.md#enterkey)
- [enterMoves](EditingOptionsIf.md#entermoves)
- [maxClearCells](EditingOptionsIf.md#maxclearcells)
- [startOnType](EditingOptionsIf.md#startontype)
- [tabMoves](EditingOptionsIf.md#tabmoves)
- [textSelection](EditingOptionsIf.md#textselection)

## Properties

### arrowKeysCommit

• **arrowKeysCommit**: `boolean`

In "enter" mode (opened by typing) the arrow keys commit and move; in "edit" mode they move the caret. Default `true`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L31)

___

### clearKeys

• **clearKeys**: `boolean`

Delete clears the selected cells, Backspace clears one cell and opens the editor. Default `true`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L35)

___

### collapseSelectionOnNavigate

• **collapseSelectionOnNavigate**: `boolean`

Arrow keys, Tab, Enter and clicks select the active cell (Excel); Shift+arrows extend from it. Default `true`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L39)

___

### ctrlEnterFillsSelection

• **ctrlEnterFillsSelection**: `boolean`

Ctrl/⌘+Enter in the editor writes the input into all selected cells. Default `true`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L37)

___

### defaultEditable

• **defaultEditable**: `boolean`

`true`: columns without an own `editable` are editable (row numbers, checkbox and group columns, calculated
columns without `valueSetter` stay read only). Default `false`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L46)

___

### emptyValue

• **emptyValue**: `unknown`

The value of a cleared cell (a column can have its own: [ColumnDefIf.emptyValue](ColumnDefIf.md#emptyvalue)). Default `""`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L41)

___

### enterKey

• **enterKey**: ``"edit"`` \| ``"moveDown"``

Enter on a cell without editor: `"edit"` opens the editor (Google Sheets, default), `"moveDown"` moves down
(Excel). Checkbox, tree, group and detail cells keep their own Enter action.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L22)

___

### enterMoves

• **enterMoves**: ``"none"`` \| ``"right"`` \| ``"down"``

Where Enter in the editor goes after committing (Shift+Enter: the opposite). Default `"down"`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L24)

___

### maxClearCells

• **maxClearCells**: `number`

At most this many cells are cleared at once (Delete). Default 1 000 000.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L48)

___

### startOnType

• **startOnType**: `boolean`

A printable key on a focused editable cell opens the editor with that character ("enter" mode). Default `true`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L17)

___

### tabMoves

• **tabMoves**: `boolean`

Tab/Shift+Tab commit and move to the next/previous shown column. In the last (first) column Tab is not used:
the browser focus leaves the table (no keyboard trap). Default `true`.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L29)

___

### textSelection

• **textSelection**: ``"all"`` \| ``"end"``

Enter and double click select the text of the editor (`"all"`, default) or put the caret at the end; F2 always at the end.

#### Defined in

[src/lib/table/sheet-editing/editing-options.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.if.ts#L33)
