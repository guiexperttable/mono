[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionService

# Class: SelectionService

## Implements

- [`OnActionTriggeredIf`](../interfaces/OnActionTriggeredIf.md)

## Table of contents

### Constructors

- [constructor](SelectionService.md#constructor)

### Properties

- [anchorRanges](SelectionService.md#anchorranges)
- [dragSnapshot](SelectionService.md#dragsnapshot)
- [getFocusModel](SelectionService.md#getfocusmodel)
- [getSelectionModel](SelectionService.md#getselectionmodel)
- [ignoreNextClick](SelectionService.md#ignorenextclick)
- [previousEvt](SelectionService.md#previousevt)
- [tableScope](SelectionService.md#tablescope)

### Methods

- [onActionTriggered](SelectionService.md#onactiontriggered)
- [onMouseClicked](SelectionService.md#onmouseclicked)
- [onMouseDown](SelectionService.md#onmousedown)
- [onMouseDragging](SelectionService.md#onmousedragging)

## Constructors

### constructor

• **new SelectionService**(`tableScope`): [`SelectionService`](SelectionService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`SelectionService`](SelectionService.md)

#### Defined in

[src/lib/table/selection/selection-service.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L28)

## Properties

### anchorRanges

• `Protected` **anchorRanges**: [`CellRange`](CellRange.md)[] = `[]`

The ranges the anchor click (or the last shift-click) added – the next shift-click replaces them.

#### Defined in

[src/lib/table/selection/selection-service.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L23)

___

### dragSnapshot

• `Protected` `Optional` **dragSnapshot**: [`SelectionSnapshot`](../interfaces/SelectionSnapshot.md)

The selection before a Ctrl/⌘-drag – each drag frame replaces only the dragged rectangle.

#### Defined in

[src/lib/table/selection/selection-service.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L25)

___

### getFocusModel

• `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Defined in

[src/lib/table/selection/selection-service.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L18)

___

### getSelectionModel

• `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Defined in

[src/lib/table/selection/selection-service.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L17)

___

### ignoreNextClick

• `Protected` **ignoreNextClick**: `boolean` = `false`

A drag selection ends with a click on another cell – that click must not clear the new range.

#### Defined in

[src/lib/table/selection/selection-service.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L21)

___

### previousEvt

• `Protected` `Optional` **previousEvt**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/selection/selection-service.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L19)

___

### tableScope

• `Protected` `Readonly` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/selection/selection-service.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L29)

## Methods

### onActionTriggered

▸ **onActionTriggered**(`actionId`): `boolean`

Triggers an action based on the provided action ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` \| ``"MOVE_ROW_UP"`` \| ``"MOVE_ROW_DOWN"`` \| ``"FILL_DOWN"`` \| ``"FILL_RIGHT"`` | The ID of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was successfully triggered; otherwise, false.

#### Implementation of

[OnActionTriggeredIf](../interfaces/OnActionTriggeredIf.md).[onActionTriggered](../interfaces/OnActionTriggeredIf.md#onactiontriggered)

#### Defined in

[src/lib/table/selection/selection-service.ts:170](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L170)

___

### onMouseClicked

▸ **onMouseClicked**(`evt`, `_previousEvt`): `boolean`

A click on a body cell: moves the focus and changes the selection.
- plain click: new selection (the clicked cell, row or column – by selection type);
- Shift: the rectangle from the previous click (the anchor) to this cell replaces what that click had selected –
  repeated Shift-clicks change the rectangle, ranges added before the anchor stay;
- Ctrl/⌘: toggles the cell (row, column); Ctrl/⌘+Alt: deselects it.

Header/footer clicks and the second click of a double click (`clickCount` 2) do not change selection or focus.
All changes of one click are reported as one `onSelectionChanged` event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeMouseEvent`](GeMouseEvent.md) | the click |
| `_previousEvt` | `undefined` \| [`GeMouseEvent`](GeMouseEvent.md) | not used (the service keeps its own anchor) |

#### Returns

`boolean`

true if focus or selection changed (repaint needed)

#### Defined in

[src/lib/table/selection/selection-service.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L96)

___

### onMouseDown

▸ **onMouseDown**(): `void`

Called on mouse down: a new gesture starts.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-service.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L40)

___

### onMouseDragging

▸ **onMouseDragging**(`evt`, `startEvt`): `boolean`

Selects a range by dragging the mouse over body cells (selection type "range").
The cell where the drag started stays the anchor, so a following shift-click extends from there.
With Ctrl/⌘ held at the start the dragged range is added to the existing selection, otherwise it replaces it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeMouseEvent`](GeMouseEvent.md) | the current mouse position |
| `startEvt` | `undefined` \| [`GeMouseEvent`](GeMouseEvent.md) | the mouse down event that started the drag |

#### Returns

`boolean`

true if the selection changed (repaint needed)

#### Defined in

[src/lib/table/selection/selection-service.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L54)
