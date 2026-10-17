[GuiExpert Table API](../README.md) / [Exports](../modules.md) / OnActionTriggeredIf

# Interface: OnActionTriggeredIf

## Implemented by

- [`SelectionService`](../classes/SelectionService.md)
- [`TableScope`](../classes/TableScope.md)

## Table of contents

### Methods

- [onActionTriggered](OnActionTriggeredIf.md#onactiontriggered)

## Methods

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

#### Defined in

[src/lib/table/action/on-action-triggered.if.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/on-action-triggered.if.ts#L13)
