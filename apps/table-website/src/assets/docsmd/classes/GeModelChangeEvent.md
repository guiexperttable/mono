[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeModelChangeEvent

# Class: GeModelChangeEvent

Reported by [EventListenerIf.onModelChanged](../interfaces/EventListenerIf.md#onmodelchanged) after cells were edited: the row and column indices
of the changed cells. The new values are already written into the area model.

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

### Methods

- [createSingle](GeModelChangeEvent.md#createsingle)

## Constructors

### constructor

• **new GeModelChangeEvent**(`cells`): [`GeModelChangeEvent`](GeModelChangeEvent.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cells` | [`GeCellIndices`](GeCellIndices.md)[] |

#### Returns

[`GeModelChangeEvent`](GeModelChangeEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L22)

## Properties

### cells

• **cells**: [`GeCellIndices`](GeCellIndices.md)[]

#### Defined in

[src/lib/table/data/common/event/ge-model-change-event.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L23)

## Methods

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

[src/lib/table/data/common/event/ge-model-change-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-model-change-event.ts#L27)
