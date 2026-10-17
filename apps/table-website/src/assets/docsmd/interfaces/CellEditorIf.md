[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellEditorIf

# Interface: CellEditorIf

A cell editor of Excel-style editing: lives in one element above the cell (it survives scrolling) until it is
committed or cancelled. Built-in: [TextCellEditor](../classes/TextCellEditor.md), [NumberCellEditor](../classes/NumberCellEditor.md), [SelectCellEditor](../classes/SelectCellEditor.md),
[DateCellEditor](../classes/DateCellEditor.md). The table handles Enter, Tab, Escape and the arrow keys; an editor that needs a key
itself (a list, a date field) says so in [wantsKey](CellEditorIf.md#wantskey).

**`Example`**

```ts
class UpperCaseEditor extends TextCellEditor {
  override getValue(): unknown {
    return String(super.getValue()).toUpperCase();
  }
}
ColumnDef.create({ property: "code", editable: TrueFn, editor: ctx => new UpperCaseEditor() });
```

**`Since`**

1.1.99

## Implemented by

- [`SelectCellEditor`](../classes/SelectCellEditor.md)
- [`TextCellEditor`](../classes/TextCellEditor.md)

## Table of contents

### Methods

- [close](CellEditorIf.md#close)
- [focus](CellEditorIf.md#focus)
- [getFocusElement](CellEditorIf.md#getfocuselement)
- [getText](CellEditorIf.md#gettext)
- [getValue](CellEditorIf.md#getvalue)
- [isComposing](CellEditorIf.md#iscomposing)
- [open](CellEditorIf.md#open)
- [setMode](CellEditorIf.md#setmode)
- [setText](CellEditorIf.md#settext)
- [wantsKey](CellEditorIf.md#wantskey)

## Methods

### close

▸ **close**(): `void`

Removes listeners and elements.

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L85)

___

### focus

▸ **focus**(): `void`

Gives the input element the keyboard focus.

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L83)

___

### getFocusElement

▸ **getFocusElement**(): `undefined` \| `HTMLElement`

The element that has the focus (the table names it and lets the active cell own it for screen readers).

#### Returns

`undefined` \| `HTMLElement`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L87)

___

### getText

▸ **getText**(): `string`

The text of the editor, e.g. `"=B2*C2"` (formula input, later stages).

#### Returns

`string`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L95)

___

### getValue

▸ **getValue**(): `unknown`

The value to write (it runs through `editInputPipe` and `validate` of the column).

#### Returns

`unknown`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L81)

___

### isComposing

▸ **isComposing**(): `boolean`

`true` while an IME composition is running – the table ignores Enter, Tab and arrows then.

#### Returns

`boolean`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L91)

___

### open

▸ **open**(`container`, `ctx`): `void`

Builds the editor into `container` (the table positions the container over the cell).

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLDivElement` |
| `ctx` | [`CellEditorContextIf`](CellEditorContextIf.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L79)

___

### setMode

▸ **setMode**(`mode`): `void`

F2 switched the mode.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | [`CellEditMode`](../modules.md#celleditmode) |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L89)

___

### setText

▸ **setText**(`text`): `void`

Replaces the text and puts the caret at the end.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L97)

___

### wantsKey

▸ **wantsKey**(`evt`, `mode`): `boolean`

`true` if the editor needs this key itself (e.g. ↑/↓ in a list) – the table does not commit then.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `KeyboardEvent` |
| `mode` | [`CellEditMode`](../modules.md#celleditmode) |

#### Returns

`boolean`

#### Defined in

[src/lib/table/sheet-editing/cell-editor.if.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor.if.ts#L93)
