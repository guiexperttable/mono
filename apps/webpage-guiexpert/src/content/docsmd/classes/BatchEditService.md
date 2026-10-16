[GuiExpert Table API](../README.md) / [Exports](../modules.md) / BatchEditService

# Class: BatchEditService

Batch edit of one table (`tableScope.batchEditService`): collects changes instead of writing them, shows them
(`ge-table-cell-pending`) and writes them on commit. Use [TableApi.startBatchEdit](TableApi.md#startbatchedit),
[TableApi.commitBatchEdit](TableApi.md#commitbatchedit), [TableApi.cancelBatchEdit](TableApi.md#cancelbatchedit) and [TableApi.getPendingChanges](TableApi.md#getpendingchanges).

The pending values belong to the row **objects** – sorting and filtering keep them on their rows. They are shown, but
sorting, filtering, totals, copy and the Excel export use the written data (like ag-Grid).

**`Since`**

1.1.96

## Table of contents

### Constructors

- [constructor](BatchEditService.md#constructor)

### Accessors

- [options](BatchEditService.md#options)

### Methods

- [addPending](BatchEditService.md#addpending)
- [cancel](BatchEditService.md#cancel)
- [commit](BatchEditService.md#commit)
- [getPendingAt](BatchEditService.md#getpendingat)
- [getPendingChanges](BatchEditService.md#getpendingchanges)
- [getShownValue](BatchEditService.md#getshownvalue)
- [hasPending](BatchEditService.md#haspending)
- [isActive](BatchEditService.md#isactive)
- [isPermanent](BatchEditService.md#ispermanent)
- [propertyOf](BatchEditService.md#propertyof)
- [pruneOrphans](BatchEditService.md#pruneorphans)
- [rowKeyOf](BatchEditService.md#rowkeyof)
- [start](BatchEditService.md#start)

## Constructors

### constructor

• **new BatchEditService**(`tableScope`): [`BatchEditService`](BatchEditService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`BatchEditService`](BatchEditService.md)

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L37)

## Accessors

### options

• `get` **options**(): [`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)

The options of this table ([TableOptionsIf.batchEdit](../interfaces/TableOptionsIf.md#batchedit) + defaults).

#### Returns

[`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L41)

## Methods

### addPending

▸ **addPending**(`inputs`): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

Marks values as pending (B1, B6, B8) and reports the step (`onBatchEditChanged`, announcement). The caller repaints.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `inputs` | [`PendingInputIf`](../interfaces/PendingInputIf.md)[] | cells with piped and raw value |

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the cells whose pending state changed

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L120)

___

### cancel

▸ **cancel**(): `void`

Discards the pending values (B4) and ends a started batch edit.

#### Returns

`void`

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:212](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L212)

___

### commit

▸ **commit**(): `boolean`

Writes the pending values (B3): shown rows through `setValue` (the pipe runs once, row groupings regroup), rows a
filter hides directly into their objects. One `onModelChanged` with all cells, then `onBatchEditChanged` "commit".

#### Returns

`boolean`

false if invalid values block the commit ([BatchEditOptionsIf.blockCommitOnInvalid](../interfaces/BatchEditOptionsIf.md#blockcommitoninvalid))

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L168)

___

### getPendingAt

▸ **getPendingAt**(`rowIndex`, `columnIndex`): `undefined` \| [`PendingCellIf`](../interfaces/PendingCellIf.md)

The pending value of a shown body cell – asked for every rendered cell (one map lookup, nothing while empty).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |
| `columnIndex` | `number` | model index |

#### Returns

`undefined` \| [`PendingCellIf`](../interfaces/PendingCellIf.md)

the entry

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L95)

___

### getPendingChanges

▸ **getPendingChanges**(): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

All pending changes with the current display indices (one scan of the shown rows).

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the pending cells

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:153](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L153)

___

### getShownValue

▸ **getShownValue**(`rowIndex`, `columnIndex`): `unknown`

The value a body cell shows: the pending value, otherwise the model value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |
| `columnIndex` | `number` | model index |

#### Returns

`unknown`

the shown value

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L109)

___

### hasPending

▸ **hasPending**(): `boolean`

True if values are pending.

#### Returns

`boolean`

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L56)

___

### isActive

▸ **isActive**(): `boolean`

True while changes are collected (started, or [isPermanent](BatchEditService.md#ispermanent)).

#### Returns

`boolean`

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L51)

___

### isPermanent

▸ **isPermanent**(): `boolean`

`tableOptions.batchEdit` is set: changes are always collected.

#### Returns

`boolean`

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L46)

___

### propertyOf

▸ **propertyOf**(`columnIndex`): `string`

The key of a column: its property, `#<index>` without one.

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`string`

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L84)

___

### pruneOrphans

▸ **pruneOrphans**(): `number`

Forgets pending values of rows that are no longer in the model (`setRows`, a reloaded tree): they would never be
shown, block a commit with an invalid value and be written into stale objects. Only for models whose rows are known
(object arrays, trees, row groupings); others keep their entries.

#### Returns

`number`

the number of removed entries

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:233](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L233)

___

### rowKeyOf

▸ **rowKeyOf**(`rowIndex`): `unknown`

The key of a shown row: its object (tree: the data), the index for models without objects.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`unknown`

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L75)

___

### start

▸ **start**(): `boolean`

Starts collecting changes (until commit or cancel).

#### Returns

`boolean`

false if a batch edit is already running

#### Defined in

[src/lib/table/batch-edit/batch-edit-service.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-service.ts#L65)
