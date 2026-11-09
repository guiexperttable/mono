[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EventCheckboxChangedHandler

# Class: EventCheckboxChangedHandler

## Hierarchy

- [`EventAdapter`](EventAdapter.md)

  ↳ **`EventCheckboxChangedHandler`**

## Table of contents

### Constructors

- [constructor](EventCheckboxChangedHandler.md#constructor)

### Methods

- [onBatchEditChanged](EventCheckboxChangedHandler.md#onbatcheditchanged)
- [onCheckboxChanged](EventCheckboxChangedHandler.md#oncheckboxchanged)
- [onColumnMoveEnd](EventCheckboxChangedHandler.md#oncolumnmoveend)
- [onColumnMoveStart](EventCheckboxChangedHandler.md#oncolumnmovestart)
- [onColumnResizeEnd](EventCheckboxChangedHandler.md#oncolumnresizeend)
- [onColumnResizeStart](EventCheckboxChangedHandler.md#oncolumnresizestart)
- [onContextmenu](EventCheckboxChangedHandler.md#oncontextmenu)
- [onDetailExpandedChanged](EventCheckboxChangedHandler.md#ondetailexpandedchanged)
- [onEditingChanged](EventCheckboxChangedHandler.md#oneditingchanged)
- [onFocusChanged](EventCheckboxChangedHandler.md#onfocuschanged)
- [onModelChanged](EventCheckboxChangedHandler.md#onmodelchanged)
- [onMouseClicked](EventCheckboxChangedHandler.md#onmouseclicked)
- [onMouseDragging](EventCheckboxChangedHandler.md#onmousedragging)
- [onMouseDraggingEnd](EventCheckboxChangedHandler.md#onmousedraggingend)
- [onMouseMoved](EventCheckboxChangedHandler.md#onmousemoved)
- [onRowDragEnd](EventCheckboxChangedHandler.md#onrowdragend)
- [onRowDragMove](EventCheckboxChangedHandler.md#onrowdragmove)
- [onRowDragStart](EventCheckboxChangedHandler.md#onrowdragstart)
- [onScroll](EventCheckboxChangedHandler.md#onscroll)
- [onSelectionChanged](EventCheckboxChangedHandler.md#onselectionchanged)
- [onStateChanged](EventCheckboxChangedHandler.md#onstatechanged)
- [onUndoStackChanged](EventCheckboxChangedHandler.md#onundostackchanged)

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

### onBatchEditChanged

▸ **onBatchEditChanged**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeBatchEditEvent`](GeBatchEditEvent.md) |

#### Returns

`void`

**`Since`**

1.1.96

#### Inherited from

[EventAdapter](EventAdapter.md).[onBatchEditChanged](EventAdapter.md#onbatcheditchanged)

#### Defined in

[src/lib/table/event-adapter.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L76)

___

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

[src/lib/table/event-adapter.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L32)

___

### onColumnMoveEnd

▸ **onColumnMoveEnd**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeColumnMoveEvent`](GeColumnMoveEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Inherited from

[EventAdapter](EventAdapter.md).[onColumnMoveEnd](EventAdapter.md#oncolumnmoveend)

#### Defined in

[src/lib/table/event-adapter.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L104)

___

### onColumnMoveStart

▸ **onColumnMoveStart**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeColumnMoveEvent`](GeColumnMoveEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Inherited from

[EventAdapter](EventAdapter.md).[onColumnMoveStart](EventAdapter.md#oncolumnmovestart)

#### Defined in

[src/lib/table/event-adapter.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L100)

___

### onColumnResizeEnd

▸ **onColumnResizeEnd**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeColumnResizeEvent`](GeColumnResizeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Inherited from

[EventAdapter](EventAdapter.md).[onColumnResizeEnd](EventAdapter.md#oncolumnresizeend)

#### Defined in

[src/lib/table/event-adapter.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L96)

___

### onColumnResizeStart

▸ **onColumnResizeStart**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeColumnResizeEvent`](GeColumnResizeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Inherited from

[EventAdapter](EventAdapter.md).[onColumnResizeStart](EventAdapter.md#oncolumnresizestart)

#### Defined in

[src/lib/table/event-adapter.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L92)

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

[src/lib/table/event-adapter.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L35)

___

### onDetailExpandedChanged

▸ **onDetailExpandedChanged**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeDetailEvent`](GeDetailEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.97

#### Inherited from

[EventAdapter](EventAdapter.md).[onDetailExpandedChanged](EventAdapter.md#ondetailexpandedchanged)

#### Defined in

[src/lib/table/event-adapter.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L80)

___

### onEditingChanged

▸ **onEditingChanged**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeEditEvent`](GeEditEvent.md) |

#### Returns

`void`

**`Since`**

1.1.99

#### Inherited from

[EventAdapter](EventAdapter.md).[onEditingChanged](EventAdapter.md#oneditingchanged)

#### Defined in

[src/lib/table/event-adapter.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L84)

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

[src/lib/table/event-adapter.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L59)

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

[src/lib/table/event-adapter.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L38)

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

[src/lib/table/event-adapter.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L41)

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

[src/lib/table/event-adapter.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L44)

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

[src/lib/table/event-adapter.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L47)

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

[src/lib/table/event-adapter.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L50)

___

### onRowDragEnd

▸ **onRowDragEnd**(`_evt`): `void`

Optional: a row drag ended – `evt.type` is `"end"` (dropped; `evt.moved` = the table moved the rows) or `"cancel"`.
Managed: called after the move (`evt.toIndex` = the real position). Save the new order here; to veto a drop, call
`evt.preventDefault()` in [onRowDragMove](../interfaces/EventListenerIf.md#onrowdragmove).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeRowDragEvent`](GeRowDragEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.95

#### Inherited from

[EventAdapter](EventAdapter.md).[onRowDragEnd](EventAdapter.md#onrowdragend)

#### Defined in

[src/lib/table/event-adapter.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L72)

___

### onRowDragMove

▸ **onRowDragMove**(`_evt`): `void`

Optional: the drop target of a row drag changed (not on every pixel). `evt.preventDefault()` marks the target as
invalid (no drop marker, no drop).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeRowDragEvent`](GeRowDragEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.95

#### Inherited from

[EventAdapter](EventAdapter.md).[onRowDragMove](EventAdapter.md#onrowdragmove)

#### Defined in

[src/lib/table/event-adapter.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L69)

___

### onRowDragStart

▸ **onRowDragStart**(`_evt`): `void`

Optional: a row drag started (drag handle moved past the threshold, or Ctrl+Alt+↑/↓). `evt.preventDefault()`
cancels it. See [GeRowDragEvent](GeRowDragEvent.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeRowDragEvent`](GeRowDragEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.95

#### Inherited from

[EventAdapter](EventAdapter.md).[onRowDragStart](EventAdapter.md#onrowdragstart)

#### Defined in

[src/lib/table/event-adapter.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L66)

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

[src/lib/table/event-adapter.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L53)

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

[src/lib/table/event-adapter.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L56)

___

### onStateChanged

▸ **onStateChanged**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeStateChangeEvent`](GeStateChangeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.92

#### Inherited from

[EventAdapter](EventAdapter.md).[onStateChanged](EventAdapter.md#onstatechanged)

#### Defined in

[src/lib/table/event-adapter.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L63)

___

### onUndoStackChanged

▸ **onUndoStackChanged**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeUndoEvent`](GeUndoEvent.md) |

#### Returns

`void`

**`Since`**

1.1.99

#### Inherited from

[EventAdapter](EventAdapter.md).[onUndoStackChanged](EventAdapter.md#onundostackchanged)

#### Defined in

[src/lib/table/event-adapter.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L88)
