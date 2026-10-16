[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeModelChangeEvent

# Class: GeModelChangeEvent

Reported by [EventListenerIf.onModelChanged](../interfaces/EventListenerIf.md#onmodelchanged) after cells were edited: the row and column indices
of the changed cells. The new values are already written into the area model.

Since 1.1.96 the event comes **once per change** – an edit, a fill (fill handle, Ctrl/⌘+D), a commit of a batch
edit or [TableApi.applyCellChanges](TableApi.md#applycellchanges) – with all cells, and [changes](GeModelChangeEvent.md#changes) tells old and new values.

**`Example`**

```ts
override onModelChanged(evt: GeModelChangeEvent): void {
  for (const { rowIndex } of evt.cells) {
    const order = tableModel.getBodyModel().getRowByIndex(rowIndex) as Order;
    order.total = order.quantity * order.price;          // recalculate derived values
  }
  tableApi.repaint();
}
```

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

## Table of contents

### Constructors

- [constructor](GeModelChangeEvent.md#constructor)

### Properties

- [cells](GeModelChangeEvent.md#cells)
- [changes](GeModelChangeEvent.md#changes)
- [source](GeModelChangeEvent.md#source)

### Methods

- [createForChanges](GeModelChangeEvent.md#createforchanges)
- [createSingle](GeModelChangeEvent.md#createsingle)

## Constructors

### constructor

• **new GeModelChangeEvent**(`cells`, `changes?`, `source?`): [`GeModelChangeEvent`](GeModelChangeEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | [`GeCellIndices`](GeCellIndices.md)[] | - |
| `changes?` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | The changed cells with row object, property, old and new value (since 1.1.96; `undefined` for events created by own code with the old constructor). |
| `source?` | [`CellChangeSource`](../modules.md#cellchangesource) | What changed the cells: `"edit"`, `"fill"`, `"commit"` or `"api"` (since 1.1.96). |

#### Returns

[`GeModelChangeEvent`](GeModelChangeEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L26)

## Properties

### cells

• **cells**: [`GeCellIndices`](GeCellIndices.md)[]

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L27)

___

### changes

• `Optional` **changes**: [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

The changed cells with row object, property, old and new value (since 1.1.96; `undefined` for events created by
own code with the old constructor).

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L32)

___

### source

• `Optional` **source**: [`CellChangeSource`](../modules.md#cellchangesource)

What changed the cells: `"edit"`, `"fill"`, `"commit"` or `"api"` (since 1.1.96).

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L34)

## Methods

### createForChanges

▸ **createForChanges**(`changes`, `source`): [`GeModelChangeEvent`](GeModelChangeEvent.md)

An event for a change set (since 1.1.96): `cells` from the row and column indices of the changes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | the changed cells |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | what changed them |

#### Returns

[`GeModelChangeEvent`](GeModelChangeEvent.md)

the event

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L45)

___

### createSingle

▸ **createSingle**(`rowIndex`, `columnIndex`): [`GeModelChangeEvent`](GeModelChangeEvent.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

[`GeModelChangeEvent`](GeModelChangeEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L51)
