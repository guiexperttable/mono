[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DateCellEditor

# Class: DateCellEditor

Editor for dates: `input type="date"`. A `Date` value comes back as `Date` (its time of day stays), an ISO text
(`"2026-10-16"`, also with a time part) as ISO text; an empty field as `""`. The arrow keys belong to the date
field.

**`Example`**

```ts
ColumnDef.create({ property: "due", editable: TrueFn, editor: "date" });
```

**`Since`**

1.1.99

## Hierarchy

- [`TextCellEditor`](TextCellEditor.md)

  ↳ **`DateCellEditor`**

## Table of contents

### Constructors

- [constructor](DateCellEditor.md#constructor)

### Properties

- [composing](DateCellEditor.md#composing)
- [ctx](DateCellEditor.md#ctx)
- [input](DateCellEditor.md#input)

### Methods

- [close](DateCellEditor.md#close)
- [decorate](DateCellEditor.md#decorate)
- [focus](DateCellEditor.md#focus)
- [getFocusElement](DateCellEditor.md#getfocuselement)
- [getText](DateCellEditor.md#gettext)
- [getValue](DateCellEditor.md#getvalue)
- [inputType](DateCellEditor.md#inputtype)
- [isComposing](DateCellEditor.md#iscomposing)
- [open](DateCellEditor.md#open)
- [setMode](DateCellEditor.md#setmode)
- [setText](DateCellEditor.md#settext)
- [toText](DateCellEditor.md#totext)
- [wantsKey](DateCellEditor.md#wantskey)

## Constructors

### constructor

• **new DateCellEditor**(): [`DateCellEditor`](DateCellEditor.md)

#### Returns

[`DateCellEditor`](DateCellEditor.md)

#### Inherited from

[TextCellEditor](TextCellEditor.md).[constructor](TextCellEditor.md#constructor)

## Properties

### composing

• `Protected` **composing**: `boolean` = `false`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[composing](TextCellEditor.md#composing)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L17)

___

### ctx

• `Protected` `Optional` **ctx**: [`CellEditorContextIf`](../interfaces/CellEditorContextIf.md)

#### Inherited from

[TextCellEditor](TextCellEditor.md).[ctx](TextCellEditor.md#ctx)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L16)

___

### input

• `Protected` `Optional` **input**: `HTMLInputElement`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[input](TextCellEditor.md#input)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L15)

## Methods

### close

▸ **close**(): `void`

Removes listeners and elements.

#### Returns

`void`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[close](TextCellEditor.md#close)

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

#### Inherited from

[TextCellEditor](TextCellEditor.md).[decorate](TextCellEditor.md#decorate)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L45)

___

### focus

▸ **focus**(): `void`

Gives the input element the keyboard focus.

#### Returns

`void`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[focus](TextCellEditor.md#focus)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L69)

___

### getFocusElement

▸ **getFocusElement**(): `undefined` \| `HTMLElement`

The element that has the focus (the table names it and lets the active cell own it for screen readers).

#### Returns

`undefined` \| `HTMLElement`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[getFocusElement](TextCellEditor.md#getfocuselement)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L95)

___

### getText

▸ **getText**(): `string`

The text of the editor, e.g. `"=B2*C2"` (formula input, later stages).

#### Returns

`string`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[getText](TextCellEditor.md#gettext)

#### Defined in

[src/lib/table/sheet-editing/editors/text-cell-editor.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/text-cell-editor.ts#L58)

___

### getValue

▸ **getValue**(): `unknown`

The value to write (it runs through `editInputPipe` and `validate` of the column).

#### Returns

`unknown`

#### Overrides

[TextCellEditor](TextCellEditor.md).[getValue](TextCellEditor.md#getvalue)

#### Defined in

[src/lib/table/sheet-editing/editors/date-cell-editor.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/date-cell-editor.ts#L41)

___

### inputType

▸ **inputType**(): `string`

The `type` attribute of the input.

#### Returns

`string`

#### Overrides

[TextCellEditor](TextCellEditor.md).[inputType](TextCellEditor.md#inputtype)

#### Defined in

[src/lib/table/sheet-editing/editors/date-cell-editor.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/date-cell-editor.ts#L20)

___

### isComposing

▸ **isComposing**(): `boolean`

`true` while an IME composition is running – the table ignores Enter, Tab and arrows then.

#### Returns

`boolean`

#### Inherited from

[TextCellEditor](TextCellEditor.md).[isComposing](TextCellEditor.md#iscomposing)

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

#### Overrides

[TextCellEditor](TextCellEditor.md).[open](TextCellEditor.md#open)

#### Defined in

[src/lib/table/sheet-editing/editors/date-cell-editor.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/date-cell-editor.ts#L34)

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

#### Inherited from

[TextCellEditor](TextCellEditor.md).[setMode](TextCellEditor.md#setmode)

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

#### Inherited from

[TextCellEditor](TextCellEditor.md).[setText](TextCellEditor.md#settext)

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

#### Overrides

[TextCellEditor](TextCellEditor.md).[toText](TextCellEditor.md#totext)

#### Defined in

[src/lib/table/sheet-editing/editors/date-cell-editor.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/date-cell-editor.ts#L24)

___

### wantsKey

▸ **wantsKey**(`evt`, `_mode`): `boolean`

`true` if the editor needs this key itself (e.g. ↑/↓ in a list) – the table does not commit then.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `KeyboardEvent` |
| `_mode` | [`CellEditMode`](../modules.md#celleditmode) |

#### Returns

`boolean`

#### Overrides

[TextCellEditor](TextCellEditor.md).[wantsKey](TextCellEditor.md#wantskey)

#### Defined in

[src/lib/table/sheet-editing/editors/date-cell-editor.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/date-cell-editor.ts#L62)
