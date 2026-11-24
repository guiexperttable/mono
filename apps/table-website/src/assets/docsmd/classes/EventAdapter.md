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

- [onBatchEditChanged](EventAdapter.md#onbatcheditchanged)
- [onCellActivated](EventAdapter.md#oncellactivated)
- [onCheckboxChanged](EventAdapter.md#oncheckboxchanged)
- [onColumnMoveEnd](EventAdapter.md#oncolumnmoveend)
- [onColumnMoveStart](EventAdapter.md#oncolumnmovestart)
- [onColumnResizeEnd](EventAdapter.md#oncolumnresizeend)
- [onColumnResizeStart](EventAdapter.md#oncolumnresizestart)
- [onContextmenu](EventAdapter.md#oncontextmenu)
- [onDetailExpandedChanged](EventAdapter.md#ondetailexpandedchanged)
- [onEditingChanged](EventAdapter.md#oneditingchanged)
- [onFilterChanged](EventAdapter.md#onfilterchanged)
- [onFocusChanged](EventAdapter.md#onfocuschanged)
- [onModelChanged](EventAdapter.md#onmodelchanged)
- [onMouseClicked](EventAdapter.md#onmouseclicked)
- [onMouseDragging](EventAdapter.md#onmousedragging)
- [onMouseDraggingEnd](EventAdapter.md#onmousedraggingend)
- [onMouseMoved](EventAdapter.md#onmousemoved)
- [onRowDragEnd](EventAdapter.md#onrowdragend)
- [onRowDragMove](EventAdapter.md#onrowdragmove)
- [onRowDragStart](EventAdapter.md#onrowdragstart)
- [onScroll](EventAdapter.md#onscroll)
- [onSelectionChanged](EventAdapter.md#onselectionchanged)
- [onStateChanged](EventAdapter.md#onstatechanged)
- [onUndoStackChanged](EventAdapter.md#onundostackchanged)

## Constructors

### constructor

• **new EventAdapter**(): [`EventAdapter`](EventAdapter.md)

#### Returns

[`EventAdapter`](EventAdapter.md)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onBatchEditChanged](../interfaces/EventListenerIf.md#onbatcheditchanged)

#### Defined in

[src/lib/table/event-adapter.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L78)

___

### onCellActivated

▸ **onCellActivated**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeCellActivateEvent`](GeCellActivateEvent.md)\<`any`, `any`\> |

#### Returns

`void`

**`Since`**

1.1.115

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onCellActivated](../interfaces/EventListenerIf.md#oncellactivated)

#### Defined in

[src/lib/table/event-adapter.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L114)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onCheckboxChanged](../interfaces/EventListenerIf.md#oncheckboxchanged)

#### Defined in

[src/lib/table/event-adapter.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L34)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onColumnMoveEnd](../interfaces/EventListenerIf.md#oncolumnmoveend)

#### Defined in

[src/lib/table/event-adapter.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L106)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onColumnMoveStart](../interfaces/EventListenerIf.md#oncolumnmovestart)

#### Defined in

[src/lib/table/event-adapter.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L102)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onColumnResizeEnd](../interfaces/EventListenerIf.md#oncolumnresizeend)

#### Defined in

[src/lib/table/event-adapter.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L98)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onColumnResizeStart](../interfaces/EventListenerIf.md#oncolumnresizestart)

#### Defined in

[src/lib/table/event-adapter.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L94)

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

[src/lib/table/event-adapter.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L37)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onDetailExpandedChanged](../interfaces/EventListenerIf.md#ondetailexpandedchanged)

#### Defined in

[src/lib/table/event-adapter.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L82)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onEditingChanged](../interfaces/EventListenerIf.md#oneditingchanged)

#### Defined in

[src/lib/table/event-adapter.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L86)

___

### onFilterChanged

▸ **onFilterChanged**(`_evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_evt` | [`GeFilterEvent`](GeFilterEvent.md) |

#### Returns

`void`

**`Since`**

1.1.114

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onFilterChanged](../interfaces/EventListenerIf.md#onfilterchanged)

#### Defined in

[src/lib/table/event-adapter.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L110)

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

[src/lib/table/event-adapter.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L61)

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

[src/lib/table/event-adapter.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L40)

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

[src/lib/table/event-adapter.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L43)

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

[src/lib/table/event-adapter.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L46)

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

[src/lib/table/event-adapter.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L49)

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

[src/lib/table/event-adapter.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L52)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onRowDragEnd](../interfaces/EventListenerIf.md#onrowdragend)

#### Defined in

[src/lib/table/event-adapter.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L74)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onRowDragMove](../interfaces/EventListenerIf.md#onrowdragmove)

#### Defined in

[src/lib/table/event-adapter.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L71)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onRowDragStart](../interfaces/EventListenerIf.md#onrowdragstart)

#### Defined in

[src/lib/table/event-adapter.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L68)

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

[src/lib/table/event-adapter.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L55)

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

[src/lib/table/event-adapter.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L58)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onStateChanged](../interfaces/EventListenerIf.md#onstatechanged)

#### Defined in

[src/lib/table/event-adapter.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L65)

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

#### Implementation of

[EventListenerIf](../interfaces/EventListenerIf.md).[onUndoStackChanged](../interfaces/EventListenerIf.md#onundostackchanged)

#### Defined in

[src/lib/table/event-adapter.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-adapter.ts#L90)
