[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectCellEditor

# Class: SelectCellEditor

Editor with a fixed list of values (`select`). ↑/↓ choose, Alt+↓ opens the list, typing jumps to the first
matching entry (browser behaviour), Enter commits.

**`Example`**

```ts
ColumnDef.create({
  property: "status", editable: TrueFn,
  editor: () => SelectCellEditor.create(["open", "paid", "void"]),
});
```

**`Since`**

1.1.99

## Implements

- [`CellEditorIf`](../interfaces/CellEditorIf.md)

## Table of contents

### Constructors

- [constructor](SelectCellEditor.md#constructor)

### Properties

- [options](SelectCellEditor.md#options)

### Methods

- [close](SelectCellEditor.md#close)
- [focus](SelectCellEditor.md#focus)
- [getFocusElement](SelectCellEditor.md#getfocuselement)
- [getText](SelectCellEditor.md#gettext)
- [getValue](SelectCellEditor.md#getvalue)
- [open](SelectCellEditor.md#open)
- [wantsKey](SelectCellEditor.md#wantskey)
- [create](SelectCellEditor.md#create)

## Constructors

### constructor

• **new SelectCellEditor**(`options`): [`SelectCellEditor`](SelectCellEditor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ValueLabelIf`](../interfaces/ValueLabelIf.md)[] |

#### Returns

[`SelectCellEditor`](SelectCellEditor.md)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L24)

## Properties

### options

• `Protected` `Readonly` **options**: [`ValueLabelIf`](../interfaces/ValueLabelIf.md)[]

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L24)

## Methods

### close

▸ **close**(): `void`

Removes listeners and elements.

#### Returns

`void`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[close](../interfaces/CellEditorIf.md#close)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L101)

___

### focus

▸ **focus**(): `void`

Gives the input element the keyboard focus.

#### Returns

`void`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[focus](../interfaces/CellEditorIf.md#focus)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L83)

___

### getFocusElement

▸ **getFocusElement**(): `undefined` \| `HTMLElement`

The element that has the focus (the table names it and lets the active cell own it for screen readers).

#### Returns

`undefined` \| `HTMLElement`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[getFocusElement](../interfaces/CellEditorIf.md#getfocuselement)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L89)

___

### getText

▸ **getText**(): `string`

The chosen value as text; with nothing chosen (the cell's value is not in the list) the start text, so that
Enter without a choice writes nothing (before 1.1.106 it emptied the cell).

#### Returns

`string`

the text

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[getText](../interfaces/CellEditorIf.md#gettext)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L76)

___

### getValue

▸ **getValue**(): `unknown`

The value to write (it runs through `editInputPipe` and `validate` of the column).

#### Returns

`unknown`

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[getValue](../interfaces/CellEditorIf.md#getvalue)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L62)

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

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L37)

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

#### Implementation of

[CellEditorIf](../interfaces/CellEditorIf.md).[wantsKey](../interfaces/CellEditorIf.md#wantskey)

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L93)

___

### create

▸ **create**(`values`): [`SelectCellEditor`](SelectCellEditor.md)

An editor whose values are their own labels.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | `string`[] | the entries |

#### Returns

[`SelectCellEditor`](SelectCellEditor.md)

the editor

#### Defined in

[src/lib/table/sheet-editing/editors/select-cell-editor.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/editors/select-cell-editor.ts#L33)
