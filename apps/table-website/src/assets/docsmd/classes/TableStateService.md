[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableStateService

# Class: TableStateService

Collects and applies the [TableStateIf](../interfaces/TableStateIf.md) of one table, stores it ([AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md)) and reports
changes ([EventListenerIf.onStateChanged](../interfaces/EventListenerIf.md#onstatechanged)). One instance per [TableScope](TableScope.md) (`tableScope.stateService`);
use the methods of [TableApi](TableApi.md) instead.

Changes are only marked ([markDirty](TableStateService.md#markdirty)); after [TableOptionsIf.stateChangedDebounceDelay](../interfaces/TableOptionsIf.md#statechangeddebouncedelay) the dirty
parts are computed once, compared with the last reported state, stored with ONE storage write and reported with
ONE event – no storage access per scroll frame.

**`Since`**

1.1.92

## Table of contents

### Constructors

- [constructor](TableStateService.md#constructor)

### Properties

- [STORAGE\_SUFFIX](TableStateService.md#storage_suffix)

### Methods

- [applyState](TableStateService.md#applystate)
- [destroy](TableStateService.md#destroy)
- [flush](TableStateService.md#flush)
- [getState](TableStateService.md#getstate)
- [initAfterFilter](TableStateService.md#initafterfilter)
- [initAfterLayout](TableStateService.md#initafterlayout)
- [initAfterModel](TableStateService.md#initaftermodel)
- [initBeforeModel](TableStateService.md#initbeforemodel)
- [markDirty](TableStateService.md#markdirty)
- [rendered](TableStateService.md#rendered)
- [resetState](TableStateService.md#resetstate)
- [setCustomState](TableStateService.md#setcustomstate)
- [sortedByColumn](TableStateService.md#sortedbycolumn)

## Constructors

### constructor

• **new TableStateService**(`scope`): [`TableStateService`](TableStateService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |

#### Returns

[`TableStateService`](TableStateService.md)

#### Defined in

[src/lib/table/state/table-state.service.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L115)

## Properties

### STORAGE\_SUFFIX

▪ `Static` `Readonly` **STORAGE\_SUFFIX**: ``"tableState"``

Suffix of the storage key: `<key>tableState`.

#### Defined in

[src/lib/table/state/table-state.service.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L79)

## Methods

### applyState

▸ **applyState**(`state`, `parts?`): `void`

Applies the parts of a state (only the parts it contains, optionally only the given ones) and repaints.
Reports the change with `onStateChanged` and stores it.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `state` | `Partial`\<[`TableStateIf`](../interfaces/TableStateIf.md)\> | `undefined` | the state |
| `parts?` | readonly [`TableStatePart`](../modules.md#tablestatepart)[] | `ALL_TABLE_STATE_PARTS` | only these parts |

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L210)

___

### destroy

▸ **destroy**(): `void`

Stops the timer and stores / reports a pending change (called by `TableScope.destroy()`).

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:375](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L375)

___

### flush

▸ **flush**(): `void`

Stores and reports the dirty parts now (normally called by the timer of [markDirty](TableStateService.md#markdirty)).

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:334](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L334)

___

### getState

▸ **getState**(`parts?`): [`TableStateIf`](../interfaces/TableStateIf.md)

The current state (all parts, or the given ones). Parts that do not apply to the table are left out (e.g. `tree`
without a tree, `columns` without column definitions).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `parts?` | readonly [`TableStatePart`](../modules.md#tablestatepart)[] | `ALL_TABLE_STATE_PARTS` | the parts to read, default: all |

#### Returns

[`TableStateIf`](../interfaces/TableStateIf.md)

the state

#### Defined in

[src/lib/table/state/table-state.service.ts:195](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L195)

___

### initAfterFilter

▸ **initAfterFilter**(): `void`

After the external filter: tree, sorting, checked rows, selection.

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L160)

___

### initAfterLayout

▸ **initAfterLayout**(): `void`

After the layout (scroll height known): scroll position; the restore is finished.

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:174](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L174)

___

### initAfterModel

▸ **initAfterModel**(): `void`

After `tableModel.init()`: remembers the defaults, applies the column layout.

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L140)

___

### initBeforeModel

▸ **initBeforeModel**(): `void`

First `firstInit()` only, before `tableModel.init()`: reads the start state and applies the header groups
(they decide which column definitions exist).

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L125)

___

### markDirty

▸ **markDirty**(`part`): `void`

Marks a part as changed. After [TableOptionsIf.stateChangedDebounceDelay](../interfaces/TableOptionsIf.md#statechangeddebouncedelay) the state is stored and
reported – only if it really changed. No effect before the table is built.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `part` | [`TableStatePart`](../modules.md#tablestatepart) | the changed part |

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:308](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L308)

___

### rendered

▸ **rendered**(): `void`

Called after each render pass: marks the scroll position as changed if it changed.

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:320](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L320)

___

### resetState

▸ **resetState**(): `void`

Back to the state right after the table was built (the code's column layout, sort icons, header groups, without
the restored state; tree, checked rows and selection when they are stored or were given as `initialState`),
scrolled to the top, custom data removed – and removes the stored state.

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:269](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L269)

___

### setCustomState

▸ **setCustomState**(`custom`): `void`

Sets the part `custom` (data of the application).

#### Parameters

| Name | Type |
| :------ | :------ |
| `custom` | `unknown` |

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:291](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L291)

___

### sortedByColumn

▸ **sortedByColumn**(`property`): `void`

The column was sorted by a header click / `sortByColumn` – it becomes the primary sort key.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `undefined` \| `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/state/table-state.service.ts:297](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.service.ts#L297)
