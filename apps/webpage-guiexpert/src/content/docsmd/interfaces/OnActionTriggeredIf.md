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
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` \| ``"MOVE_ROW_UP"`` \| ``"MOVE_ROW_DOWN"`` | The ID of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was successfully triggered; otherwise, false.

#### Defined in

[src/lib/table/action/on-action-triggered.if.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/on-action-triggered.if.ts#L13)
