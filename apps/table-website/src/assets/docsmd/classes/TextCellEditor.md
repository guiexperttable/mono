[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TextCellEditor

# Class: TextCellEditor

The default editor of Excel-style editing: a text field (`input type="text"`). Built with DOM APIs only (no
inline handlers, no `innerHTML`) – it works under a strict Content Security Policy.

**`Example`**

```ts
ColumnDef.create({ property: "name", editable: TrueFn, editor: () => new TextCellEditor() });
```

**`Since`**

1.1.99

## Hierarchy

- **`TextCellEditor`**

  ↳ [`NumberCellEditor`](NumberCellEditor.md)

  ↳ [`DateCellEditor`](DateCellEditor.md)

## Implements

- [`CellEditorIf`](../interfaces/CellEditorIf.md)

## Table of contents

### Constructors

- [constructor](TextCellEditor.md#constructor)

### Properties

- [composing](TextCellEditor.md#composing)
- [ctx](TextCellEditor.md#ctx)
- [input](TextCellEditor.md#input)

### Methods

- [close](TextCellEditor.md#close)
- [decorate](TextCellEditor.md#decorate)
- [focus](TextCellEditor.md#focus)
- [getFocusElement](TextCellEditor.md#getfocuselement)
- [getText](TextCellEditor.md#gettext)
- [getValue](TextCellEditor.md#getvalue)
- [inputType](TextCellEditor.md#inputtype)
- [isComposing](TextCellEditor.md#iscomposing)
- [open](TextCellEditor.md#open)
- [setMode](TextCellEditor.md#setmode)
- [setText](TextCellEditor.md#settext)
- [toText](TextCellEditor.md#totext)
- [wantsKey](TextCellEditor.md#wantskey)

## Constructors

### constructor

• **new TextCellEditor**(): [`TextCellEditor`](TextCellEditor.md)

#### Returns

[`TextCellEditor`](TextCellEditor.md)

## Properties

### composing

• `Protected` **composing**: `boolean` = `false`

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L17)

___

### ctx

• `Protected` `Optional` **ctx**: [`CellEditorContextIf`](../interfaces/CellEditorContextIf.md)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L16)

___

### input

• `Protected` `Optional` **input**: `HTMLInputElement`

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L15)

## Methods

### close

▸ **close**(): `void`

Removes listeners and elements.

#### Returns

`void`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[close](../interfaces/CellEditorIf.md#close)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L111)

___

### decorate

▸ **decorate**(`_input`, `_ctx`): `void`

Extra attributes and classes (subclasses).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_input` | `HTMLInputElement` |
| `_ctx` | [`CellEditorContextIf`](../interfaces/CellEditorContextIf.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L45)

___

### focus

▸ **focus**(): `void`

Gives the input element the keyboard focus.

#### Returns

`void`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[focus](../interfaces/CellEditorIf.md#focus)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L69)

___

### getFocusElement

▸ **getFocusElement**(): `undefined` \| `HTMLElement`

The element that has the focus (the table names it and lets the active cell own it for screen readers).

#### Returns

`undefined` \| `HTMLElement`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[getFocusElement](../interfaces/CellEditorIf.md#getfocuselement)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L95)

___

### getText

▸ **getText**(): `string`

The text of the editor, e.g. `"=B2*C2"` (formula input, later stages).

#### Returns

`string`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[getText](../interfaces/CellEditorIf.md#gettext)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L58)

___

### getValue

▸ **getValue**(): `unknown`

The value to write (it runs through `editInputPipe` and `validate` of the column).

#### Returns

`unknown`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[getValue](../interfaces/CellEditorIf.md#getvalue)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L54)

___

### inputType

▸ **inputType**(): `string`

The `type` attribute of the input.

#### Returns

`string`

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L40)

___

### isComposing

▸ **isComposing**(): `boolean`

`true` while an IME composition is running – the table ignores Enter, Tab and arrows then.

#### Returns

`boolean`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[isComposing](../interfaces/CellEditorIf.md#iscomposing)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L103)

___

### open

▸ **open**(`container`, `ctx`): `void`

Builds the editor into `container` (the table positions the container over the cell).

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLDivElement` |
| `ctx` | [`CellEditorContextIf`](../interfaces/CellEditorContextIf.md) |

#### Returns

`void`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[open](../interfaces/CellEditorIf.md#open)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L20)

___

### setMode

▸ **setMode**(`_mode`): `void`

F2 switched the mode.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_mode` | [`CellEditMode`](../modules.md#celleditmode) |

#### Returns

`void`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[setMode](../interfaces/CellEditorIf.md#setmode)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L99)

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

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[setText](../interfaces/CellEditorIf.md#settext)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L62)

___

### toText

▸ **toText**(`ctx`): `string`

The start text from the cell value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`CellEditorContextIf`](../interfaces/CellEditorContextIf.md) |

#### Returns

`string`

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L50)

___

### wantsKey

▸ **wantsKey**(`_evt`, `_mode`): `boolean`

`true` if the editor needs this key itself (e.g. ↑/↓ in a list) – the table does not commit then.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | `KeyboardEvent` |
| `_mode` | [`CellEditMode`](../modules.md#celleditmode) |

#### Returns

`boolean`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[wantsKey](../interfaces/CellEditorIf.md#wantskey)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L107)
