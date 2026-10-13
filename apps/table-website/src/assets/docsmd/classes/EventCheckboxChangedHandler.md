[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EventCheckboxChangedHandler

# Class: EventCheckboxChangedHandler

## Hierarchy

- [`EventAdapter`](EventAdapter.md)

  ↳ **`EventCheckboxChangedHandler`**

## Table of contents

### Constructors

- [constructor](EventCheckboxChangedHandler.md#constructor)

### Methods

- [onCheckboxChanged](EventCheckboxChangedHandler.md#oncheckboxchanged)
- [onContextmenu](EventCheckboxChangedHandler.md#oncontextmenu)
- [onFocusChanged](EventCheckboxChangedHandler.md#onfocuschanged)
- [onModelChanged](EventCheckboxChangedHandler.md#onmodelchanged)
- [onMouseClicked](EventCheckboxChangedHandler.md#onmouseclicked)
- [onMouseDragging](EventCheckboxChangedHandler.md#onmousedragging)
- [onMouseDraggingEnd](EventCheckboxChangedHandler.md#onmousedraggingend)
- [onMouseMoved](EventCheckboxChangedHandler.md#onmousemoved)
- [onScroll](EventCheckboxChangedHandler.md#onscroll)
- [onSelectionChanged](EventCheckboxChangedHandler.md#onselectionchanged)

## Constructors

### constructor

• **new EventCheckboxChangedHandler**(`onCheckboxChangedCallback`): [`EventCheckboxChangedHandler`](EventCheckboxChangedHandler.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `onCheckboxChangedCallback` | (`evt`: `any`[]) => `void` |

#### Returns

[`EventCheckboxChangedHandler`](EventCheckboxChangedHandler.md)

#### Overrides

[EventAdapter](EventAdapter.md).[constructor](EventAdapter.md#constructor)

#### Defined in

[src/lib/table/event-checkbox-changed-handler.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-checkbox-changed-handler.ts#L7)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onCheckboxChanged](EventAdapter.md#oncheckboxchanged)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onContextmenu](EventAdapter.md#oncontextmenu)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onFocusChanged](EventAdapter.md#onfocuschanged)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onModelChanged](EventAdapter.md#onmodelchanged)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onMouseClicked](EventAdapter.md#onmouseclicked)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onMouseDragging](EventAdapter.md#onmousedragging)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onMouseDraggingEnd](EventAdapter.md#onmousedraggingend)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onMouseMoved](EventAdapter.md#onmousemoved)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onScroll](EventAdapter.md#onscroll)

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

#### Inherited from

[EventAdapter](EventAdapter.md).[onSelectionChanged](EventAdapter.md#onselectionchanged)

#### Defined in

[src/lib/table/event-adapter.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L48)
