[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EditingOptions

# Class: EditingOptions

The defaults of [EditingOptionsIf](../interfaces/EditingOptionsIf.md) (Excel-style editing, [TableOptionsIf.editing](../interfaces/TableOptionsIf.md#editing)).

**`Example`**

```ts
const options = EditingOptions.create(true);
options?.enterKey;   // "edit"
```

**`Since`**

1.1.99

## Implements

- [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)

## Table of contents

### Constructors

- [constructor](EditingOptions.md#constructor)

### Properties

- [arrowKeysCommit](EditingOptions.md#arrowkeyscommit)
- [clearKeys](EditingOptions.md#clearkeys)
- [collapseSelectionOnNavigate](EditingOptions.md#collapseselectiononnavigate)
- [ctrlEnterFillsSelection](EditingOptions.md#ctrlenterfillsselection)
- [defaultEditable](EditingOptions.md#defaulteditable)
- [emptyValue](EditingOptions.md#emptyvalue)
- [enterKey](EditingOptions.md#enterkey)
- [enterMoves](EditingOptions.md#entermoves)
- [maxClearCells](EditingOptions.md#maxclearcells)
- [startOnType](EditingOptions.md#startontype)
- [tabMoves](EditingOptions.md#tabmoves)
- [textSelection](EditingOptions.md#textselection)

### Methods

- [create](EditingOptions.md#create)

## Constructors

### constructor

• **new EditingOptions**(): [`EditingOptions`](EditingOptions.md)

#### Returns

[`EditingOptions`](EditingOptions.md)

## Properties

### arrowKeysCommit

• **arrowKeysCommit**: `boolean` = `true`

In "enter" mode (opened by typing) the arrow keys commit and move; in "edit" mode they move the caret. Default `true`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[arrowKeysCommit](../interfaces/EditingOptionsIf.md#arrowkeyscommit)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L18)

___

### clearKeys

• **clearKeys**: `boolean` = `true`

Delete clears the selected cells, Backspace clears one cell and opens the editor. Default `true`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[clearKeys](../interfaces/EditingOptionsIf.md#clearkeys)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L20)

___

### collapseSelectionOnNavigate

• **collapseSelectionOnNavigate**: `boolean` = `true`

Arrow keys, Tab, Enter and clicks select the active cell (Excel); Shift+arrows extend from it. Default `true`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[collapseSelectionOnNavigate](../interfaces/EditingOptionsIf.md#collapseselectiononnavigate)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L22)

___

### ctrlEnterFillsSelection

• **ctrlEnterFillsSelection**: `boolean` = `true`

Ctrl/⌘+Enter in the editor writes the input into all selected cells. Default `true`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[ctrlEnterFillsSelection](../interfaces/EditingOptionsIf.md#ctrlenterfillsselection)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L21)

___

### defaultEditable

• **defaultEditable**: `boolean` = `false`

`true`: columns without an own `editable` are editable (row numbers, checkbox and group columns, calculated
columns without `valueSetter` stay read only). Default `false`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[defaultEditable](../interfaces/EditingOptionsIf.md#defaulteditable)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L24)

___

### emptyValue

• **emptyValue**: `unknown` = `""`

The value of a cleared cell (a column can have its own: [ColumnDefIf.emptyValue](../interfaces/ColumnDefIf.md#emptyvalue)). Default `""`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[emptyValue](../interfaces/EditingOptionsIf.md#emptyvalue)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L23)

___

### enterKey

• **enterKey**: ``"edit"`` \| ``"moveDown"`` = `"edit"`

Enter on a cell without editor: `"edit"` opens the editor (Google Sheets, default), `"moveDown"` moves down
(Excel). Checkbox, tree, group and detail cells keep their own Enter action.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[enterKey](../interfaces/EditingOptionsIf.md#enterkey)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L15)

___

### enterMoves

• **enterMoves**: ``"none"`` \| ``"right"`` \| ``"down"`` = `"down"`

Where Enter in the editor goes after committing (Shift+Enter: the opposite). Default `"down"`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[enterMoves](../interfaces/EditingOptionsIf.md#entermoves)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L16)

___

### maxClearCells

• **maxClearCells**: `number` = `1_000_000`

At most this many cells are cleared at once (Delete). Default 1 000 000.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[maxClearCells](../interfaces/EditingOptionsIf.md#maxclearcells)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L25)

___

### startOnType

• **startOnType**: `boolean` = `true`

A printable key on a focused editable cell opens the editor with that character ("enter" mode). Default `true`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[startOnType](../interfaces/EditingOptionsIf.md#startontype)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L14)

___

### tabMoves

• **tabMoves**: `boolean` = `true`

Tab/Shift+Tab commit and move to the next/previous shown column. In the last (first) column Tab is not used:
the browser focus leaves the table (no keyboard trap). Default `true`.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[tabMoves](../interfaces/EditingOptionsIf.md#tabmoves)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L17)

___

### textSelection

• **textSelection**: ``"all"`` \| ``"end"`` = `"all"`

Enter and double click select the text of the editor (`"all"`, default) or put the caret at the end; F2 always at the end.

#### Implementation of

[EditingOptionsIf](../interfaces/EditingOptionsIf.md).[textSelection](../interfaces/EditingOptionsIf.md#textselection)

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L19)

## Methods

### create

▸ **create**(`option?`): `undefined` \| [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)

The options of [TableOptionsIf.editing](../interfaces/TableOptionsIf.md#editing): `undefined`/`false` = off, `true` = the defaults, an object = the
defaults overridden by its values (`undefined` keeps the default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)\> | `tableOptions.editing` |

#### Returns

`undefined` \| [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)

complete options, `undefined` if Excel-style editing is off

#### Defined in

[src/lib/table/sheet-editing/editing-options.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editing-options.ts#L34)
