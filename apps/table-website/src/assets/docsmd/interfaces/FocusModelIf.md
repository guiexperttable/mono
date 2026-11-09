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
- [adjustForRowChanges](FocusModelIf.md#adjustforrowchanges)
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

[src/lib/table/focus/focus-model.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L21)

___

### adjustForRowChanges

▸ **adjustForRowChanges**(`shift`): `void`

Optional (live data, since 1.1.108): the focused row moves along when rows were removed at the start or
inserted (`tableApi.appendRows()`). Same row: no event. Focused row removed: the next remaining row gets the
focus (with an event).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shift` | [`RowIndexShift`](../classes/RowIndexShift.md) | how the display indices move |

#### Returns

`void`

**`Example`**

```ts
focusModel.adjustForRowChanges?.(new RowIndexShift([0], []));
```

#### Defined in

[src/lib/table/focus/focus-model.if.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L52)

___

### clear

▸ **clear**(): `void`

No cell has the focus afterwards.

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L26)

___

### clearChanged

▸ **clearChanged**(): `void`

Resets [hasChanged](FocusModelIf.md#haschanged).

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L41)

___

### getEventFocusChangedListeners

▸ **getEventFocusChangedListeners**(): [`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md)[]

The registered listeners.

#### Returns

[`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md)[]

#### Defined in

[src/lib/table/focus/focus-model.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L19)

___

### getFocus

▸ **getFocus**(): [`number`, `number`]

`[rowIndex, columnIndex]` of the focused cell (-1 if none).

#### Returns

[`number`, `number`]

#### Defined in

[src/lib/table/focus/focus-model.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L35)

___

### hasChanged

▸ **hasChanged**(): `boolean`

Did the focus change since [clearChanged](FocusModelIf.md#clearchanged)?

#### Returns

`boolean`

#### Defined in

[src/lib/table/focus/focus-model.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L38)

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

[src/lib/table/focus/focus-model.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L32)

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

[src/lib/table/focus/focus-model.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L23)

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

[src/lib/table/focus/focus-model.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.if.ts#L29)
