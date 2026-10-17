[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellEditorContextIf

# Interface: CellEditorContextIf

What a [CellEditorIf](CellEditorIf.md) gets when it opens (Excel-style editing, [TableOptionsIf.editing](TableOptionsIf.md#editing)).

**`Since`**

1.1.99

## Table of contents

### Properties

- [ariaLabel](CellEditorContextIf.md#arialabel)
- [columnDef](CellEditorContextIf.md#columndef)
- [columnIndex](CellEditorContextIf.md#columnindex)
- [direction](CellEditorContextIf.md#direction)
- [domService](CellEditorContextIf.md#domservice)
- [input](CellEditorContextIf.md#input)
- [mode](CellEditorContextIf.md#mode)
- [row](CellEditorContextIf.md#row)
- [rowIndex](CellEditorContextIf.md#rowindex)
- [textSelection](CellEditorContextIf.md#textselection)
- [typedText](CellEditorContextIf.md#typedtext)
- [value](CellEditorContextIf.md#value)

### Methods

- [cancel](CellEditorContextIf.md#cancel)
- [commit](CellEditorContextIf.md#commit)
- [inputChanged](CellEditorContextIf.md#inputchanged)

## Properties

### ariaLabel

• `Readonly` **ariaLabel**: `string`

Accessible name of the editor (the column label).

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L49)

___

### columnDef

• `Optional` `Readonly` **columnDef**: [`ColumnDefIf`](ColumnDefIf.md)

The column definition, if the model has one.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L35)

___

### columnIndex

• `Readonly` **columnIndex**: `number`

Model column index.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L31)

___

### direction

• `Readonly` **direction**: ``"ltr"`` \| ``"rtl"``

Writing direction of the table.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L47)

___

### domService

• `Readonly` **domService**: [`DomServiceIf`](DomServiceIf.md)

DOM access of the table.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L51)

___

### input

• `Readonly` **input**: `string`

The value as editor text, e.g. `"42"` – the editor starts with it unless [typedText](CellEditorContextIf.md#typedtext) is set.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L39)

___

### mode

• `Readonly` **mode**: [`CellEditMode`](../modules.md#celleditmode)

"enter" (typed) or "edit" (F2, Enter, double click).

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L43)

___

### row

• `Readonly` **row**: `unknown`

The row object (the data of a tree row), `undefined` for models without objects.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L33)

___

### rowIndex

• `Readonly` **rowIndex**: `number`

Display row index of the edited body cell.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L29)

___

### textSelection

• `Readonly` **textSelection**: ``"all"`` \| ``"end"``

"all": select the text, "end": caret at the end (F2 is always "end").

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L45)

___

### typedText

• `Optional` `Readonly` **typedText**: `string`

The character typed to open the editor ("enter" mode); it replaces the content.

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L41)

___

### value

• `Readonly` **value**: `unknown`

The current value of the cell (a pending value in a batch edit).

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L37)

## Methods

### cancel

▸ **cancel**(): `void`

Close without writing.

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L55)

___

### commit

▸ **commit**(`move?`): `void`

The editor is done (e.g. a value was chosen in a list): commit and move.

#### Parameters

| Name | Type |
| :------ | :------ |
| `move?` | [`EditMove`](../modules.md#editmove) |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L53)

___

### inputChanged

▸ **inputChanged**(): `void`

The text changed (the table reports it as `GeEditEvent` of the type `"input"`).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L57)
