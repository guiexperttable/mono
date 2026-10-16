[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeDetailEvent

# Class: GeDetailEvent\<T\>

Reported by [EventListenerIf.onDetailExpandedChanged](../interfaces/EventListenerIf.md#ondetailexpandedchanged): a detail row was expanded or collapsed (master/detail,
[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md)).

**`Example`**

```ts
const listener = new EventAdapter();
listener.onDetailExpandedChanged = (evt: GeDetailEvent) => {
  console.log(`order ${evt.row.id} ${evt.expanded ? "opened" : "closed"} (${evt.source})`);
};
```

**`Since`**

1.1.97

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Constructors

- [constructor](GeDetailEvent.md#constructor)

### Properties

- [expanded](GeDetailEvent.md#expanded)
- [row](GeDetailEvent.md#row)
- [rowIndex](GeDetailEvent.md#rowindex)
- [source](GeDetailEvent.md#source)

## Constructors

### constructor

• **new GeDetailEvent**\<`T`\>(`row`, `rowIndex`, `expanded`, `source`): [`GeDetailEvent`](GeDetailEvent.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `T` | The master row. |
| `rowIndex` | `number` | Its display index (`-1` if it is not shown, e.g. filtered out). |
| `expanded` | `boolean` | `true` = expanded, `false` = collapsed. |
| `source` | [`GeDetailEventSource`](../modules.md#gedetaileventsource) | What changed it. |

#### Returns

[`GeDetailEvent`](GeDetailEvent.md)\<`T`\>

#### Defined in

[src/lib/table/data/common/event/ge-detail-event.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-detail-event.ts#L25)

## Properties

### expanded

• `Readonly` **expanded**: `boolean`

`true` = expanded, `false` = collapsed.

#### Defined in

[src/lib/table/data/common/event/ge-detail-event.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-detail-event.ts#L31)

___

### row

• `Readonly` **row**: `T`

The master row.

#### Defined in

[src/lib/table/data/common/event/ge-detail-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-detail-event.ts#L27)

___

### rowIndex

• `Readonly` **rowIndex**: `number`

Its display index (`-1` if it is not shown, e.g. filtered out).

#### Defined in

[src/lib/table/data/common/event/ge-detail-event.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-detail-event.ts#L29)

___

### source

• `Readonly` **source**: [`GeDetailEventSource`](../modules.md#gedetaileventsource)

What changed it.

#### Defined in

[src/lib/table/data/common/event/ge-detail-event.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-detail-event.ts#L33)
