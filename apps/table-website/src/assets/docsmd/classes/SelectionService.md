[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionService

# Class: SelectionService

## Implements

- [`OnActionTriggeredIf`](../interfaces/OnActionTriggeredIf.md)

## Table of contents

### Constructors

- [constructor](SelectionService.md#constructor)

### Properties

- [anchor](SelectionService.md#anchor)
- [anchorRanges](SelectionService.md#anchorranges)
- [dragSnapshot](SelectionService.md#dragsnapshot)
- [extent](SelectionService.md#extent)
- [getFocusModel](SelectionService.md#getfocusmodel)
- [getSelectionModel](SelectionService.md#getselectionmodel)
- [ignoreNextClick](SelectionService.md#ignorenextclick)
- [previousEvt](SelectionService.md#previousevt)
- [tableScope](SelectionService.md#tablescope)

### Methods

- [collapseTo](SelectionService.md#collapseto)
- [extendTo](SelectionService.md#extendto)
- [getAnchor](SelectionService.md#getanchor)
- [getExtent](SelectionService.md#getextent)
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

[src/lib/table/selection/selection-service.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L32)

## Properties

### anchor

• `Protected` `Optional` **anchor**: [`number`, `number`]

The cell a Shift+click or Shift+arrow range starts at (the last click, or the active cell).

**`Since`**

1.1.99

#### Defined in

[src/lib/table/selection/selection-service.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L27)

___

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

### extent

• `Protected` `Optional` **extent**: [`number`, `number`]

The moving corner of the range of Shift+arrows (Excel); `undefined` = the anchor.

**`Since`**

1.1.99

#### Defined in

[src/lib/table/selection/selection-service.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L29)

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

[src/lib/table/selection/selection-service.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L33)

## Methods

### collapseTo

▸ **collapseTo**(`rowIndex`, `columnIndex`): `void`

Excel-style editing: the active cell moved (arrow keys, Tab, Enter) – the selection becomes this one cell and it
is the new anchor. Selection types other than `"range"`/`"cell"` only get the anchor.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row index |
| `columnIndex` | `number` | model column index |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/selection/selection-service.ts:259](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L259)

___

### extendTo

▸ **extendTo**(`rowIndex`, `columnIndex`): `undefined` \| [`CellRange`](CellRange.md)

Excel-style editing (Shift+arrows): the last range is spanned from the anchor to `(rowIndex, columnIndex)`;
other ranges (Ctrl/⌘-clicks) stay. Only for the selection type `"range"`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the new moving corner (display row index) |
| `columnIndex` | `number` | model column index |

#### Returns

`undefined` \| [`CellRange`](CellRange.md)

the new range, `undefined` without a range selection

**`Since`**

1.1.99

#### Defined in

[src/lib/table/selection/selection-service.ts:290](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L290)

___

### getAnchor

▸ **getAnchor**(): `undefined` \| [`number`, `number`]

The cell a Shift+click or Shift+arrow range starts at: the last clicked cell or the active cell set by the
keyboard ([collapseTo](SelectionService.md#collapseto)).

#### Returns

`undefined` \| [`number`, `number`]

row and column, `undefined` before the first click/keyboard move

**`Since`**

1.1.99

#### Defined in

[src/lib/table/selection/selection-service.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L230)

___

### getExtent

▸ **getExtent**(): `undefined` \| [`number`, `number`]

The moving corner of the range Shift+arrows grow (the anchor if there is none).

#### Returns

`undefined` \| [`number`, `number`]

row and column

**`Since`**

1.1.99

#### Defined in

[src/lib/table/selection/selection-service.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L240)

___

### onActionTriggered

▸ **onActionTriggered**(`actionId`): `boolean`

Triggers an action based on the provided action ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` \| ``"MOVE_ROW_UP"`` \| ``"MOVE_ROW_DOWN"`` \| ``"FILL_DOWN"`` \| ``"FILL_RIGHT"`` \| ``"NAVIGATE_NEXT_CELL"`` \| ``"NAVIGATE_PREVIOUS_CELL"`` \| ``"EXTEND_SELECTION_UP"`` \| ``"EXTEND_SELECTION_DOWN"`` \| ``"EXTEND_SELECTION_LEFT"`` \| ``"EXTEND_SELECTION_RIGHT"`` \| ``"EXTEND_SELECTION_ROW_START"`` \| ``"EXTEND_SELECTION_ROW_END"`` \| ``"EXTEND_SELECTION_PAGE_UP"`` \| ``"EXTEND_SELECTION_PAGE_DOWN"`` \| ``"NAVIGATE_DATA_EDGE_UP"`` \| ``"NAVIGATE_DATA_EDGE_DOWN"`` \| ``"NAVIGATE_DATA_EDGE_LEFT"`` \| ``"NAVIGATE_DATA_EDGE_RIGHT"`` \| ``"EXTEND_TO_DATA_EDGE_UP"`` \| ``"EXTEND_TO_DATA_EDGE_DOWN"`` \| ``"EXTEND_TO_DATA_EDGE_LEFT"`` \| ``"EXTEND_TO_DATA_EDGE_RIGHT"`` \| ``"SELECT_ROW"`` \| ``"SELECT_COLUMN"`` \| ``"CLEAR_CELLS"`` \| ``"CLEAR_AND_EDIT"`` \| ``"CUT_2_CLIPBOARD"`` \| ``"PASTE_FROM_CLIPBOARD"`` \| ``"UNDO"`` \| ``"REDO"`` | The ID of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was successfully triggered; otherwise, false.

#### Implementation of

[OnActionTriggeredIf](../interfaces/OnActionTriggeredIf.md).[onActionTriggered](../interfaces/OnActionTriggeredIf.md#onactiontriggered)

#### Defined in

[src/lib/table/selection/selection-service.ts:185](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L185)

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

[src/lib/table/selection/selection-service.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L102)

___

### onMouseDown

▸ **onMouseDown**(): `void`

Called on mouse down: a new gesture starts.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-service.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L44)

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

[src/lib/table/selection/selection-service.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L58)
