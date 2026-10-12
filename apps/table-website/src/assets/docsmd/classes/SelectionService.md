[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionService

# Class: SelectionService

## Implements

- [`OnActionTriggeredIf`](../interfaces/OnActionTriggeredIf.md)

## Table of contents

### Constructors

- [constructor](SelectionService.md#constructor)

### Properties

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

[src/lib/table/selection/selection-service.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L21)

## Properties

### getFocusModel

• `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Defined in

[src/lib/table/selection/selection-service.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L15)

___

### getSelectionModel

• `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Defined in

[src/lib/table/selection/selection-service.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L14)

___

### ignoreNextClick

• `Protected` **ignoreNextClick**: `boolean` = `false`

A drag selection ends with a click on another cell – that click must not clear the new range.

#### Defined in

[src/lib/table/selection/selection-service.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L18)

___

### previousEvt

• `Protected` `Optional` **previousEvt**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/selection/selection-service.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L16)

___

### tableScope

• `Protected` `Readonly` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/selection/selection-service.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L22)

## Methods

### onActionTriggered

▸ **onActionTriggered**(`actionId`): `boolean`

Triggers an action based on the provided action ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` | The ID of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was successfully triggered; otherwise, false.

#### Implementation of

[OnActionTriggeredIf](../interfaces/OnActionTriggeredIf.md).[onActionTriggered](../interfaces/OnActionTriggeredIf.md#onactiontriggered)

#### Defined in

[src/lib/table/selection/selection-service.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L124)

___

### onMouseClicked

▸ **onMouseClicked**(`evt`, `_previousEvt`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](GeMouseEvent.md) |
| `_previousEvt` | `undefined` \| [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-service.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L64)

___

### onMouseDown

▸ **onMouseDown**(): `void`

Called on mouse down: a new gesture starts.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-service.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L33)

___

### onMouseDragging

▸ **onMouseDragging**(`evt`, `startEvt`): `boolean`

Selects a range by dragging the mouse over body cells (selection type "range").
The cell where the drag started stays the anchor, so a following shift-click extends from there.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeMouseEvent`](GeMouseEvent.md) | the current mouse position |
| `startEvt` | `undefined` \| [`GeMouseEvent`](GeMouseEvent.md) | the mouse down event that started the drag |

#### Returns

`boolean`

true if the selection changed (repaint needed)

#### Defined in

[src/lib/table/selection/selection-service.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-service.ts#L45)
