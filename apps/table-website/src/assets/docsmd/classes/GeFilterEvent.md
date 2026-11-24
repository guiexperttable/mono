[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeFilterEvent

# Class: GeFilterEvent

Reported by [EventListenerIf.onFilterChanged](../interfaces/EventListenerIf.md#onfilterchanged) after column filters changed, the table re-filtered and
rendered (so `tableApi.getDisplayedRowCount()` already equals [rowCount](GeFilterEvent.md#rowcount)).

**`Example`**

```ts
const listener = new EventAdapter();
listener.onFilterChanged = (evt: GeFilterEvent) => {
  console.log(`${evt.rowCount} of ${evt.unfilteredRowCount} rows`, evt.filters);
};
```

**`Since`**

1.1.114

## Table of contents

### Constructors

- [constructor](GeFilterEvent.md#constructor)

### Properties

- [filters](GeFilterEvent.md#filters)
- [property](GeFilterEvent.md#property)
- [rowCount](GeFilterEvent.md#rowcount)
- [source](GeFilterEvent.md#source)
- [unfilteredRowCount](GeFilterEvent.md#unfilteredrowcount)

## Constructors

### constructor

• **new GeFilterEvent**(`filters`, `property`, `source`, `rowCount`, `unfilteredRowCount`): [`GeFilterEvent`](GeFilterEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`ColumnFiltersMap`](../modules.md#columnfiltersmap) | Snapshot of all currently active column filters (property → filter). |
| `property` | `undefined` \| `string` | Property of the changed column, or `undefined` for `setColumnFilters`, `clearColumnFilters` and state restore. |
| `source` | [`GeFilterEventSource`](../modules.md#gefiltereventsource) | What triggered the change. |
| `rowCount` | `number` | Displayed body row count after filtering. |
| `unfilteredRowCount` | `number` | Total body row count before filtering. |

#### Returns

[`GeFilterEvent`](GeFilterEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-filter-event.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-filter-event.ts#L25)

## Properties

### filters

• `Readonly` **filters**: [`ColumnFiltersMap`](../modules.md#columnfiltersmap)

Snapshot of all currently active column filters (property → filter).

#### Defined in

[src/lib/table/data/common/event/ge-filter-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-filter-event.ts#L27)

___

### property

• `Readonly` **property**: `undefined` \| `string`

Property of the changed column, or `undefined` for `setColumnFilters`, `clearColumnFilters` and state restore.

#### Defined in

[src/lib/table/data/common/event/ge-filter-event.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-filter-event.ts#L29)

___

### rowCount

• `Readonly` **rowCount**: `number`

Displayed body row count after filtering.

#### Defined in

[src/lib/table/data/common/event/ge-filter-event.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-filter-event.ts#L33)

___

### source

• `Readonly` **source**: [`GeFilterEventSource`](../modules.md#gefiltereventsource)

What triggered the change.

#### Defined in

[src/lib/table/data/common/event/ge-filter-event.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-filter-event.ts#L31)

___

### unfilteredRowCount

• `Readonly` **unfilteredRowCount**: `number`

Total body row count before filtering.

#### Defined in

[src/lib/table/data/common/event/ge-filter-event.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-filter-event.ts#L35)
