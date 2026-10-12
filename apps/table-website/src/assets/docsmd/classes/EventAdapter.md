[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EventAdapter

# Class: EventAdapter

Empty implementation of [EventListenerIf](../interfaces/EventListenerIf.md) – extend it and override only the events you need.

**`Example`**

```ts
class TreeEvents extends EventAdapter {
  override onCheckboxChanged(rows: any[]): void {
    console.log(`${rows.length} rows checked`);
  }
}
```

**`See`**

Training: [Events and a context menu of your own](https://gui.expert/training/events-and-context-menu/)

## Hierarchy

- **`EventAdapter`**

  ↳ [`EventCheckboxChangedHandler`](EventCheckboxChangedHandler.md)

## Implements

- [`EventListenerIf`](../interfaces/EventListenerIf.md)

## Table of contents

### Constructors

- [constructor](EventAdapter.md#constructor)

### Methods

- [onCheckboxChanged](EventAdapter.md#oncheckboxchanged)
- [onContextmenu](EventAdapter.md#oncontextmenu)
- [onFocusChanged](EventAdapter.md#onfocuschanged)
- [onModelChanged](EventAdapter.md#onmodelchanged)
- [onMouseClicked](EventAdapter.md#onmouseclicked)
- [onMouseDragging](EventAdapter.md#onmousedragging)
- [onMouseDraggingEnd](EventAdapter.md#onmousedraggingend)
- [onMouseMoved](EventAdapter.md#onmousemoved)
- [onScroll](EventAdapter.md#onscroll)
- [onSelectionChanged](EventAdapter.md#onselectionchanged)

## Constructors

### constructor

• **new EventAdapter**(): [`EventAdapter`](EventAdapter.md)

#### Returns

[`EventAdapter`](EventAdapter.md)

## Methods

### onCheckboxChanged

▸ **onCheckboxChanged**(`_evt`): `void`

Checked rows changed (row checkboxes, tree checkboxes) – the argument holds all checked rows.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | `any`[] |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onCheckboxChanged](../interfaces/EventListenerIf.md#oncheckboxchanged)

#### Defined in

[src/lib/table/event-adapter.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L24)

___

### onContextmenu

▸ **onContextmenu**(`_evt`): `void`

Right-click on the table. Call `evt.originalEvent?.preventDefault()` to suppress the browser menu (e.g. for an own menu).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onContextmenu](../interfaces/EventListenerIf.md#oncontextmenu)

#### Defined in

[src/lib/table/event-adapter.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L27)

___

### onFocusChanged

▸ **onFocusChanged**(`_model`): `void`

The focused cell changed – read it from [FocusModelIf.getFocus](../interfaces/FocusModelIf.md#getfocus).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_model` | [`FocusModelIf`](../interfaces/FocusModelIf.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onFocusChanged](../interfaces/EventListenerIf.md#onfocuschanged)

#### Defined in

[src/lib/table/event-adapter.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L51)

___

### onModelChanged

▸ **onModelChanged**(`_evt`): `void`

Cells were edited – `evt.cells` holds row and column index of each; the new value is already in the model (your row object).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeModelChangeEvent`](GeModelChangeEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onModelChanged](../interfaces/EventListenerIf.md#onmodelchanged)

#### Defined in

[src/lib/table/event-adapter.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L30)

___

### onMouseClicked

▸ **onMouseClicked**(`_evt`): `void`

A click on the table. A double-click on the same cell is reported again with `clickCount === 2`
(after the first click with `clickCount === 1`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onMouseClicked](../interfaces/EventListenerIf.md#onmouseclicked)

#### Defined in

[src/lib/table/event-adapter.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L33)

___

### onMouseDragging

▸ **onMouseDragging**(`_evt`): `void`

The mouse is being dragged; `evt.draggingX` / `evt.draggingY` hold the distance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onMouseDragging](../interfaces/EventListenerIf.md#onmousedragging)

#### Defined in

[src/lib/table/event-adapter.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L36)

___

### onMouseDraggingEnd

▸ **onMouseDraggingEnd**(`_evt`): `void`

A drag with the mouse ended (column resize, column move or range selection).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onMouseDraggingEnd](../interfaces/EventListenerIf.md#onmousedraggingend)

#### Defined in

[src/lib/table/event-adapter.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L39)

___

### onMouseMoved

▸ **onMouseMoved**(`_evt`): `void`

The mouse moved over the table (cell under the mouse in `evt`). Called often – keep it cheap.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onMouseMoved](../interfaces/EventListenerIf.md#onmousemoved)

#### Defined in

[src/lib/table/event-adapter.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L42)

___

### onScroll

▸ **onScroll**(`_evt`): `void`

The table was scrolled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeScrollEvent`](GeScrollEvent.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onScroll](../interfaces/EventListenerIf.md#onscroll)

#### Defined in

[src/lib/table/event-adapter.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L45)

___

### onSelectionChanged

▸ **onSelectionChanged**(`_model`): `void`

The selection changed – read it from [SelectionModelIf.getRanges](../interfaces/SelectionModelIf.md#getranges).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_model` | [`SelectionModelIf`](../interfaces/SelectionModelIf.md) |

#### Returns

`void`

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onSelectionChanged](../interfaces/EventListenerIf.md#onselectionchanged)

#### Defined in

[src/lib/table/event-adapter.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L48)
