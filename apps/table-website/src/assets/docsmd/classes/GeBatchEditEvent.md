[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeBatchEditEvent

# Class: GeBatchEditEvent

Reported by [EventListenerIf.onBatchEditChanged](../interfaces/EventListenerIf.md#onbatcheditchanged): the pending changes of a batch edit changed – e.g. to enable
a "Save" button.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onBatchEditChanged = (evt: GeBatchEditEvent) => {
  saveButton.disabled = evt.pendingCount === 0 || evt.invalidCount > 0;
  discardButton.disabled = evt.pendingCount === 0;
};
```

**`Since`**

1.1.96

## Table of contents

### Constructors

- [constructor](GeBatchEditEvent.md#constructor)

### Properties

- [changes](GeBatchEditEvent.md#changes)
- [invalidCount](GeBatchEditEvent.md#invalidcount)
- [pendingCount](GeBatchEditEvent.md#pendingcount)
- [type](GeBatchEditEvent.md#type)

### Accessors

- [pendingChanges](GeBatchEditEvent.md#pendingchanges)

## Constructors

### constructor

• **new GeBatchEditEvent**(`type`, `changes`, `pendingCount`, `invalidCount`, `pendingProvider?`): [`GeBatchEditEvent`](GeBatchEditEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeBatchEditEventType`](../modules.md#gebatchediteventtype) | What happened. |
| `changes` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | The cells of this step (`"commit"`: the written cells, `"cancel"`: the discarded ones). |
| `pendingCount` | `number` | The number of pending cells after this step. |
| `invalidCount` | `number` | The number of pending cells with an invalid value. |
| `pendingProvider` | () => [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | - |

#### Returns

[`GeBatchEditEvent`](GeBatchEditEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-batch-edit-event.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-batch-edit-event.ts#L28)

## Properties

### changes

• `Readonly` **changes**: [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

The cells of this step (`"commit"`: the written cells, `"cancel"`: the discarded ones).

#### Defined in

[src/lib/table/data/common/event/ge-batch-edit-event.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-batch-edit-event.ts#L32)

___

### invalidCount

• `Readonly` **invalidCount**: `number`

The number of pending cells with an invalid value.

#### Defined in

[src/lib/table/data/common/event/ge-batch-edit-event.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-batch-edit-event.ts#L36)

___

### pendingCount

• `Readonly` **pendingCount**: `number`

The number of pending cells after this step.

#### Defined in

[src/lib/table/data/common/event/ge-batch-edit-event.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-batch-edit-event.ts#L34)

___

### type

• `Readonly` **type**: [`GeBatchEditEventType`](../modules.md#gebatchediteventtype)

What happened.

#### Defined in

[src/lib/table/data/common/event/ge-batch-edit-event.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-batch-edit-event.ts#L30)

## Accessors

### pendingChanges

• `get` **pendingChanges**(): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

All pending changes after this step (computed when read – it scans the shown rows once).

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

#### Defined in

[src/lib/table/data/common/event/ge-batch-edit-event.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-batch-edit-event.ts#L42)
