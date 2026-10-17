[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaAssist

# Class: FormulaAssist

The formula input of the cell editor (prompt 013 stage 6, `tableOptions.cellFormulas`): pointing (arrow keys, Shift
+ arrow keys, a click or a drag insert references while the caret stands at an insertion point), F4 (`$`), colored
references in the text (a mirror behind the transparent text of the input) with frames around the referenced cells,
function suggestions (an ARIA combobox with a listbox) and the argument hint (a tooltip). Created by the
[CellEditorService](CellEditorService.md) for a text field in a formula column.

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](FormulaAssist.md#constructor)

### Methods

- [destroy](FormulaAssist.md#destroy)
- [getOwnedIds](FormulaAssist.md#getownedids)
- [onKeyDown](FormulaAssist.md#onkeydown)
- [onPointerDown](FormulaAssist.md#onpointerdown)
- [update](FormulaAssist.md#update)

## Constructors

### constructor

• **new FormulaAssist**(`scope`, `sheet`, `input`, `container`, `editedCell`, `changed`, `idPrefix`): [`FormulaAssist`](FormulaAssist.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |
| `sheet` | [`TableSheet`](TableSheet.md) |
| `input` | `HTMLInputElement` |
| `container` | `HTMLDivElement` |
| `editedCell` | () => [`number`, `number`] |
| `changed` | () => `void` |
| `idPrefix` | `string` |

#### Returns

[`FormulaAssist`](FormulaAssist.md)

#### Defined in

[src/lib/table/sheet-editing/formula-assist.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/formula-assist.ts#L52)

## Methods

### destroy

▸ **destroy**(): `void`

Removes everything (the editor closes).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/formula-assist.ts:196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/formula-assist.ts#L196)

___

### getOwnedIds

▸ **getOwnedIds**(): `string`[]

#### Returns

`string`[]

the ids of the suggestion list and the hint (owned by the edited cell, `aria-owns`)

#### Defined in

[src/lib/table/sheet-editing/formula-assist.ts:186](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/formula-assist.ts#L186)

___

### onKeyDown

▸ **onKeyDown**(`evt`, `mode`): `boolean`

A key in the editor: the suggestion list, F4 and pointing. True if it was used (the caller stops it).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `KeyboardEvent` | the key |
| `mode` | [`CellEditMode`](../modules.md#celleditmode) | "enter" (typing) or "edit" (F2: arrow keys move the caret) |

#### Returns

`boolean`

true if handled

#### Defined in

[src/lib/table/sheet-editing/formula-assist.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/formula-assist.ts#L115)

___

### onPointerDown

▸ **onPointerDown**(`evt`): `boolean`

A pointer press outside the editor: while pointing is possible, a body cell is inserted as reference (Shift: a
range from the last pointed cell) and dragging spans a range. True if it was used – the click then neither
commits nor moves the selection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `PointerEvent` | the press |

#### Returns

`boolean`

true if handled

#### Defined in

[src/lib/table/sheet-editing/formula-assist.ts:168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/formula-assist.ts#L168)

___

### update

▸ **update**(): `void`

Places the frames and the popups (after every render pass and on changes).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/formula-assist.ts:191](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/formula-assist.ts#L191)
