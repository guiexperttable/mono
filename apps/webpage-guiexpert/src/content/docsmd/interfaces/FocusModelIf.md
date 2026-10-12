[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FocusModelIf

# Interface: FocusModelIf

The focused cell of a table (moved by click and arrow keys; F2 edits it). The implementation is [FocusModel](../classes/FocusModel.md);
changes are reported to [EventListenerIf.onFocusChanged](EventListenerIf.md#onfocuschanged).

**`Example`**

```ts
override onFocusChanged(model: FocusModelIf): void {
  const [row, col] = model.getFocus();
  console.log(`focus on row ${row}, column ${col}`);
}
```

## Implemented by

- [`FocusModel`](../classes/FocusModel.md)

## Table of contents

### Methods

- [addEventFocusChangedListener](FocusModelIf.md#addeventfocuschangedlistener)
- [clear](FocusModelIf.md#clear)
- [clearChanged](FocusModelIf.md#clearchanged)
- [getEventFocusChangedListeners](FocusModelIf.md#geteventfocuschangedlisteners)
- [getFocus](FocusModelIf.md#getfocus)
- [hasChanged](FocusModelIf.md#haschanged)
- [hasFocus](FocusModelIf.md#hasfocus)
- [removeEventFocusChangedListener](FocusModelIf.md#removeeventfocuschangedlistener)
- [setFocus](FocusModelIf.md#setfocus)

## Methods

### addEventFocusChangedListener

▸ **addEventFocusChangedListener**(`listener`): `void`

Get notified when the focus moves.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L20)

___

### clear

▸ **clear**(): `void`

No cell has the focus afterwards.

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L25)

___

### clearChanged

▸ **clearChanged**(): `void`

Resets [hasChanged](FocusModelIf.md#haschanged).

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L40)

___

### getEventFocusChangedListeners

▸ **getEventFocusChangedListeners**(): [`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md)[]

The registered listeners.

#### Returns

[`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md)[]

#### Defined in

[src/lib/table/focus/focus-model.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L18)

___

### getFocus

▸ **getFocus**(): [`number`, `number`]

`[rowIndex, columnIndex]` of the focused cell (-1 if none).

#### Returns

[`number`, `number`]

#### Defined in

[src/lib/table/focus/focus-model.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L34)

___

### hasChanged

▸ **hasChanged**(): `boolean`

Did the focus change since [clearChanged](FocusModelIf.md#clearchanged)?

#### Returns

`boolean`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L37)

___

### hasFocus

▸ **hasFocus**(`rowIndex`, `columnIndex`): `boolean`

Has this cell the focus?

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L31)

___

### removeEventFocusChangedListener

▸ **removeEventFocusChangedListener**(`listener`): `void`

Stop notifications.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L22)

___

### setFocus

▸ **setFocus**(`rowIndex`, `columnIndex`): `void`

Moves the focus to a body cell.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L28)
