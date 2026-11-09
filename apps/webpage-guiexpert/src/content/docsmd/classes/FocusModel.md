[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FocusModel

# Class: FocusModel

The `FocusModel` class is an implementation of the `FocusModelIf` interface.
It provides core functionality to manage focus inside a data grid or spreadsheet-like structure.
The focus can be set to a specific cell or to the whole row.
This class also maintains a list of `EventFocusChangedListenerIf` instances and notifies them
whenever there is a change in focus.

## Instance Properties:
 - `selectionType: FocusType` — Specifies the type of selection that is currently in focus. It could be either a specific cell or the whole row. Defaults to "none".
 - `rowIndex: number` — Specifies the row index of the cell that is currently in focus.
 - `columnIndex: number` — Specifies the column index of the cell that is currently in focus.
 - `listenerArr: EventFocusChangedListenerIf[]` — An array of `EventFocusChangedListenerIf` instances. These instances will be triggered when the focus changes.
 - `changed` — A boolean flag to check if the focus has changed since the last trigger.

## Instance Methods:
 - `getEventFocusChangedListeners` — Returns an array of `EventFocusChangedListenerIf` instances.
 - `addEventFocusChangedListener(listener: EventFocusChangedListenerIf): void` — Adds a listener to the listeners array, if it's not already present.
 - `removeEventFocusChangedListener(listener: EventFocusChangedListenerIf): void` — Removes a listener from the listeners array.
 - `clear`: void  — Clears the current focus.
 - `setFocus(rowIndex: number, columnIndex: number): void` — Sets focus on a given cell.
 - `hasChanged(): boolean` — Checks if the focus has changed.
 - `clearChanged`: void — Clears the `changed` flag.
 - `hasFocus(rowIndex: number, columnIndex: number): boolean` — Checks if a given cell is in focus.
 - `getFocus(): [number, number]` — Returns the row and column indexes of the cell that's currently in focus.

## Usage Example
 ```typescript

class MyFocusChangeListener implements EventFocusChangedListenerIf {
  onFocusChanged(model: FocusModelIf): void {
    console.log('Focus changed: ', model.getFocus());
  }
}
let focusModel = new FocusModel("cell");
focusModel.addEventFocusChangedListener(new MyFocusChangeListener());
focusModel.setFocus(2, 3);
```

**`See`**

 - [FocusType](../modules.md#focustype)
 - [EventFocusChangedListenerIf](../interfaces/EventFocusChangedListenerIf.md)

**`Implements`**

## Implements

- [`FocusModelIf`](../interfaces/FocusModelIf.md)

## Table of contents

### Constructors

- [constructor](FocusModel.md#constructor)

### Properties

- [changed](FocusModel.md#changed)
- [columnIndex](FocusModel.md#columnindex)
- [rowIndex](FocusModel.md#rowindex)
- [selectionType](FocusModel.md#selectiontype)

### Methods

- [addEventFocusChangedListener](FocusModel.md#addeventfocuschangedlistener)
- [adjustForRowChanges](FocusModel.md#adjustforrowchanges)
- [clear](FocusModel.md#clear)
- [clearChanged](FocusModel.md#clearchanged)
- [fireChangeEvent](FocusModel.md#firechangeevent)
- [getEventFocusChangedListeners](FocusModel.md#geteventfocuschangedlisteners)
- [getFocus](FocusModel.md#getfocus)
- [hasChanged](FocusModel.md#haschanged)
- [hasFocus](FocusModel.md#hasfocus)
- [removeEventFocusChangedListener](FocusModel.md#removeeventfocuschangedlistener)
- [setFocus](FocusModel.md#setfocus)

## Constructors

### constructor

• **new FocusModel**(`selectionType?`): [`FocusModel`](FocusModel.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `selectionType` | [`FocusType`](../modules.md#focustype) | `"none"` |

#### Returns

[`FocusModel`](FocusModel.md)

#### Defined in

[src/lib/table/focus/focus-model.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L61)

## Properties

### changed

• `Protected` **changed**: `boolean` = `false`

#### Defined in

[src/lib/table/focus/focus-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L57)

___

### columnIndex

• `Protected` **columnIndex**: `number` = `-1`

#### Defined in

[src/lib/table/focus/focus-model.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L56)

___

### rowIndex

• `Protected` **rowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/focus/focus-model.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L55)

___

### selectionType

• **selectionType**: [`FocusType`](../modules.md#focustype) = `"none"`

#### Defined in

[src/lib/table/focus/focus-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L62)

## Methods

### addEventFocusChangedListener

▸ **addEventFocusChangedListener**(`listener`): `void`

Get notified when the focus moves.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventFocusChangedListenerIf`](../interfaces/EventFocusChangedListenerIf.md) |

#### Returns

`void`

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[addEventFocusChangedListener](../interfaces/FocusModelIf.md#addeventfocuschangedlistener)

#### Defined in

[src/lib/table/focus/focus-model.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L70)

___

### adjustForRowChanges

▸ **adjustForRowChanges**(`shift`): `void`

Live data (since 1.1.108): the focused row moves along when rows were removed at the start or inserted
(`tableApi.appendRows()`). The same row keeps the focus without an event; if it was removed, the next remaining
row gets it (with an event – the table keeps it inside the rows).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shift` | [`RowIndexShift`](RowIndexShift.md) | how the display indices move |

#### Returns

`void`

**`Example`**

```ts
focusModel.adjustForRowChanges?.(new RowIndexShift([0, 1], []));   // row 5 → row 3
```

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[adjustForRowChanges](../interfaces/FocusModelIf.md#adjustforrowchanges)

#### Defined in

[src/lib/table/focus/focus-model.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L125)

___

### clear

▸ **clear**(): `void`

No cell has the focus afterwards.

#### Returns

`void`

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[clear](../interfaces/FocusModelIf.md#clear)

#### Defined in

[src/lib/table/focus/focus-model.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L96)

___

### clearChanged

▸ **clearChanged**(): `void`

Resets [hasChanged](../interfaces/FocusModelIf.md#haschanged).

#### Returns

`void`

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[clearChanged](../interfaces/FocusModelIf.md#clearchanged)

#### Defined in

[src/lib/table/focus/focus-model.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L88)

___

### fireChangeEvent

▸ **fireChangeEvent**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/focus/focus-model.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L84)

___

### getEventFocusChangedListeners

▸ **getEventFocusChangedListeners**(): [`EventFocusChangedListenerIf`](../interfaces/EventFocusChangedListenerIf.md)[]

The registered listeners.

#### Returns

[`EventFocusChangedListenerIf`](../interfaces/EventFocusChangedListenerIf.md)[]

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[getEventFocusChangedListeners](../interfaces/FocusModelIf.md#geteventfocuschangedlisteners)

#### Defined in

[src/lib/table/focus/focus-model.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L66)

___

### getFocus

▸ **getFocus**(): [`number`, `number`]

`[rowIndex, columnIndex]` of the focused cell (-1 if none).

#### Returns

[`number`, `number`]

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[getFocus](../interfaces/FocusModelIf.md#getfocus)

#### Defined in

[src/lib/table/focus/focus-model.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L143)

___

### hasChanged

▸ **hasChanged**(): `boolean`

Did the focus change since [clearChanged](../interfaces/FocusModelIf.md#clearchanged)?

#### Returns

`boolean`

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[hasChanged](../interfaces/FocusModelIf.md#haschanged)

#### Defined in

[src/lib/table/focus/focus-model.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L92)

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

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[hasFocus](../interfaces/FocusModelIf.md#hasfocus)

#### Defined in

[src/lib/table/focus/focus-model.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L139)

___

### removeEventFocusChangedListener

▸ **removeEventFocusChangedListener**(`listener`): `void`

Stop notifications.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventFocusChangedListenerIf`](../interfaces/EventFocusChangedListenerIf.md) |

#### Returns

`void`

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[removeEventFocusChangedListener](../interfaces/FocusModelIf.md#removeeventfocuschangedlistener)

#### Defined in

[src/lib/table/focus/focus-model.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L76)

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

#### Implementation of

[FocusModelIf](../interfaces/FocusModelIf.md).[setFocus](../interfaces/FocusModelIf.md#setfocus)

#### Defined in

[src/lib/table/focus/focus-model.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/focus/focus-model.ts#L103)
