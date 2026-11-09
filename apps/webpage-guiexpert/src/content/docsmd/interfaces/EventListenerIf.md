[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EventListenerIf

# Interface: EventListenerIf

Receives the events of a table – the fifth argument of `new TableScope(…)`.
Extend [EventAdapter](../classes/EventAdapter.md) and override only the methods you need.

In the framework wrappers the same events arrive as callback props (`mouseClicked`, `selectionChanged` …),
Vue events, Angular outputs or bubbling `CustomEvent`s of the Web Component.

**`Example`**

```ts
class OrderEvents extends EventAdapter {
  override onMouseClicked(evt: GeMouseEvent): void {
    if (evt.areaIdent === "body" && evt.clickCount === 2) {
      const order = tableModel.getBodyModel().getRowByIndex(evt.rowIndex);   // displayed row → object
      console.log("double-click on", order);
    }
  }
  override onSelectionChanged(model: SelectionModelIf): void {
    console.log(model.getRanges());
  }
}
new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new OrderEvents()).firstInit();
```

**`See`**

Training: [Events and a context menu of your own](https://gui.expert/training/events-and-context-menu/)

## Hierarchy

- [`EventFocusChangedListenerIf`](EventFocusChangedListenerIf.md)

- [`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)

  ↳ **`EventListenerIf`**

## Implemented by

- [`EventAdapter`](../classes/EventAdapter.md)

## Table of contents

### Methods

- [onBatchEditChanged](EventListenerIf.md#onbatcheditchanged)
- [onCheckboxChanged](EventListenerIf.md#oncheckboxchanged)
- [onColumnMoveEnd](EventListenerIf.md#oncolumnmoveend)
- [onColumnMoveStart](EventListenerIf.md#oncolumnmovestart)
- [onColumnResizeEnd](EventListenerIf.md#oncolumnresizeend)
- [onColumnResizeStart](EventListenerIf.md#oncolumnresizestart)
- [onContextmenu](EventListenerIf.md#oncontextmenu)
- [onDetailExpandedChanged](EventListenerIf.md#ondetailexpandedchanged)
- [onEditingChanged](EventListenerIf.md#oneditingchanged)
- [onFocusChanged](EventListenerIf.md#onfocuschanged)
- [onModelChanged](EventListenerIf.md#onmodelchanged)
- [onMouseClicked](EventListenerIf.md#onmouseclicked)
- [onMouseDragging](EventListenerIf.md#onmousedragging)
- [onMouseDraggingEnd](EventListenerIf.md#onmousedraggingend)
- [onMouseMoved](EventListenerIf.md#onmousemoved)
- [onRowDragEnd](EventListenerIf.md#onrowdragend)
- [onRowDragMove](EventListenerIf.md#onrowdragmove)
- [onRowDragStart](EventListenerIf.md#onrowdragstart)
- [onScroll](EventListenerIf.md#onscroll)
- [onSelectionChanged](EventListenerIf.md#onselectionchanged)
- [onStateChanged](EventListenerIf.md#onstatechanged)
- [onUndoStackChanged](EventListenerIf.md#onundostackchanged)

## Methods

### onBatchEditChanged

▸ **onBatchEditChanged**(`evt`): `void`

The pending changes of a batch edit changed: values were marked, set back, written or discarded
([TableApi.startBatchEdit](../classes/TableApi.md#startbatchedit), [TableOptionsIf.batchEdit](TableOptionsIf.md#batchedit)). Optional.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeBatchEditEvent`](../classes/GeBatchEditEvent.md) | type, cells of this step, number of pending and invalid cells |

#### Returns

`void`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/event-listener.if.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L117)

___

### onCheckboxChanged

▸ **onCheckboxChanged**(`evt`): `void`

Checked rows changed (row checkboxes, tree checkboxes) – the argument holds all checked rows.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L63)

___

### onColumnMoveEnd

▸ **onColumnMoveEnd**(`evt`): `void`

Optional: a column move ended – `evt.type` `"end"` (`evt.moved` = another index) or `"cancel"` (Escape: the old
order is back). Once per start, no event for the steps in between, after the table applied the order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeColumnMoveEvent`](../classes/GeColumnMoveEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Defined in

[src/lib/table/event-listener.if.ts:172](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L172)

___

### onColumnMoveStart

▸ **onColumnMoveStart**(`evt`): `void`

Optional: the user started to move a column (dragged its header 4 px). Not reported for API calls. See
[GeColumnMoveEvent](../classes/GeColumnMoveEvent.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeColumnMoveEvent`](../classes/GeColumnMoveEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Defined in

[src/lib/table/event-listener.if.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L164)

___

### onColumnResizeEnd

▸ **onColumnResizeEnd**(`evt`): `void`

Optional: a column resize ended – `evt.type` `"end"` (also released outside the table) or `"cancel"` (Escape: the
old width is back). Once per start, after the table applied the width: save the column layout here.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeColumnResizeEvent`](../classes/GeColumnResizeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Defined in

[src/lib/table/event-listener.if.ts:156](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L156)

___

### onColumnResizeStart

▸ **onColumnResizeStart**(`evt`): `void`

Optional: the user started to resize a column (the mouse moved 4 px with the resize handle pressed, or a double
click on it). Not reported for API calls. See [GeColumnResizeEvent](../classes/GeColumnResizeEvent.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeColumnResizeEvent`](../classes/GeColumnResizeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.110

#### Defined in

[src/lib/table/event-listener.if.ts:148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L148)

___

### onContextmenu

▸ **onContextmenu**(`evt`): `void`

Right-click on the table. Call `evt.originalEvent?.preventDefault()` to suppress the browser menu (e.g. for an own menu).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](../classes/GeMouseEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L45)

___

### onDetailExpandedChanged

▸ **onDetailExpandedChanged**(`evt`): `void`

A detail row was expanded or collapsed (master/detail, [TableOptionsIf.masterDetail](TableOptionsIf.md#masterdetail)).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeDetailEvent`](../classes/GeDetailEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/event-listener.if.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L124)

___

### onEditingChanged

▸ **onEditingChanged**(`evt`): `void`

The cell editor opened, its text changed (Excel-style editing), it committed or it was cancelled. Optional.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeEditEvent`](../classes/GeEditEvent.md) | type, cell, mode, editor text |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/event-listener.if.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L132)

___

### onFocusChanged

▸ **onFocusChanged**(`model`): `void`

The focused cell changed – read it from [FocusModelIf.getFocus](FocusModelIf.md#getfocus).

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`FocusModelIf`](FocusModelIf.md) |

#### Returns

`void`

#### Overrides

[EventFocusChangedListenerIf](EventFocusChangedListenerIf.md).[onFocusChanged](EventFocusChangedListenerIf.md#onfocuschanged)

#### Defined in

[src/lib/table/event-listener.if.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L75)

___

### onModelChanged

▸ **onModelChanged**(`evt`): `void`

Cells were edited – `evt.cells` holds row and column index of each; the new value is already in the model (your row object).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeModelChangeEvent`](../classes/GeModelChangeEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L66)

___

### onMouseClicked

▸ **onMouseClicked**(`evt`): `void`

A click on the table. A double-click on the same cell is reported again with `clickCount === 2`
(after the first click with `clickCount === 1`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](../classes/GeMouseEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L60)

___

### onMouseDragging

▸ **onMouseDragging**(`evt`): `void`

The mouse is being dragged; `evt.draggingX` / `evt.draggingY` hold the distance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](../classes/GeMouseEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L54)

___

### onMouseDraggingEnd

▸ **onMouseDraggingEnd**(`evt`): `void`

A drag with the mouse ended (column resize, column move or range selection).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](../classes/GeMouseEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L51)

___

### onMouseMoved

▸ **onMouseMoved**(`evt`): `void`

The mouse moved over the table (cell under the mouse in `evt`). Called often – keep it cheap.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](../classes/GeMouseEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L48)

___

### onRowDragEnd

▸ **onRowDragEnd**(`evt`): `void`

Optional: a row drag ended – `evt.type` is `"end"` (dropped; `evt.moved` = the table moved the rows) or `"cancel"`.
Managed: called after the move (`evt.toIndex` = the real position). Save the new order here; to veto a drop, call
`evt.preventDefault()` in [onRowDragMove](EventListenerIf.md#onrowdragmove).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeRowDragEvent`](../classes/GeRowDragEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/event-listener.if.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L108)

___

### onRowDragMove

▸ **onRowDragMove**(`evt`): `void`

Optional: the drop target of a row drag changed (not on every pixel). `evt.preventDefault()` marks the target as
invalid (no drop marker, no drop).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeRowDragEvent`](../classes/GeRowDragEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/event-listener.if.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L99)

___

### onRowDragStart

▸ **onRowDragStart**(`evt`): `void`

Optional: a row drag started (drag handle moved past the threshold, or Ctrl+Alt+↑/↓). `evt.preventDefault()`
cancels it. See [GeRowDragEvent](../classes/GeRowDragEvent.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeRowDragEvent`](../classes/GeRowDragEvent.md)\<`any`\> |

#### Returns

`void`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/event-listener.if.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L91)

___

### onScroll

▸ **onScroll**(`evt`): `void`

The table was scrolled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeScrollEvent`](../classes/GeScrollEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/event-listener.if.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L69)

___

### onSelectionChanged

▸ **onSelectionChanged**(`model`): `void`

The selection changed – read it from [SelectionModelIf.getRanges](SelectionModelIf.md#getranges).

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`SelectionModelIf`](SelectionModelIf.md) |

#### Returns

`void`

#### Overrides

[EventSelectionChangedListenerIf](EventSelectionChangedListenerIf.md).[onSelectionChanged](EventSelectionChangedListenerIf.md#onselectionchanged)

#### Defined in

[src/lib/table/event-listener.if.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L72)

___

### onStateChanged

▸ **onStateChanged**(`evt`): `void`

The state of the table changed (column layout, sorting, scroll position, tree, checked or selected rows,
header groups, custom data) – reported once after the changes settled, see [GeStateChangeEvent](../classes/GeStateChangeEvent.md).
Save `evt.state` e.g. on your server and pass it back as [TableOptionsIf.initialState](TableOptionsIf.md#initialstate).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeStateChangeEvent`](../classes/GeStateChangeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/event-listener.if.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L83)

___

### onUndoStackChanged

▸ **onUndoStackChanged**(`evt`): `void`

The undo history changed (undo and redo, [TableOptionsIf.undo](TableOptionsIf.md#undo)) – to enable and label own buttons. Optional.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeUndoEvent`](../classes/GeUndoEvent.md) | can undo/redo, labels, size |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/event-listener.if.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/event-listener.if.ts#L140)
