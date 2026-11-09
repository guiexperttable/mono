[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeColumnMoveEvent

# Class: GeColumnMoveEvent

The user moves a column by dragging its header ([EventListenerIf.onColumnMoveStart](../interfaces/EventListenerIf.md#oncolumnmovestart),
[EventListenerIf.onColumnMoveEnd](../interfaces/EventListenerIf.md#oncolumnmoveend)).

One start and one end per drag – no event for the steps in between (the table moves the column while the mouse
moves). Only user actions report it, not [TableApi.applyState](TableApi.md#applystate) or `tableModel.changeColumnOrder()`. The end
comes after the table applied the order: in the handler `tableApi.getTableModel().getColumnDefs()` and
[TableApi.getState](TableApi.md#getstate) already have it.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onColumnMoveEnd = (evt: GeColumnMoveEvent) => {
  if (evt.moved) {
    localStorage.setItem("column-order", JSON.stringify(evt.columnOrder));
  }
};
```

**`Since`**

1.1.110

## Table of contents

### Constructors

- [constructor](GeColumnMoveEvent.md#constructor)

### Properties

- [columnDef](GeColumnMoveEvent.md#columndef)
- [columnOrder](GeColumnMoveEvent.md#columnorder)
- [fromIndex](GeColumnMoveEvent.md#fromindex)
- [originalEvent](GeColumnMoveEvent.md#originalevent)
- [property](GeColumnMoveEvent.md#property)
- [toIndex](GeColumnMoveEvent.md#toindex)
- [type](GeColumnMoveEvent.md#type)

### Accessors

- [moved](GeColumnMoveEvent.md#moved)

## Constructors

### constructor

• **new GeColumnMoveEvent**(`type`, `fromIndex`, `toIndex`, `columnDef`, `property`, `columnOrder`, `originalEvent?`): [`GeColumnMoveEvent`](GeColumnMoveEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeColumnDragEventType`](../modules.md#gecolumndrageventtype) | Phase: `"start"`, `"end"` or `"cancel"` (Escape: the old order is back). |
| `fromIndex` | `number` | Model index of the column when the drag started. |
| `toIndex` | `number` | Model index of the column now (`"start"` and `"cancel"`: `fromIndex`; `"end"`: also when it did not change). |
| `columnDef` | `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | The column definition of the dragged column. |
| `property` | `undefined` \| `string` | The property of the dragged column (`columnDef.property`). |
| `columnOrder` | `string`[] | The properties of all columns in the order now (after the move for `"end"`). |
| `originalEvent?` | `Event` | The browser event behind it (mouse up; `undefined` for [TableApi.cancelColumnDrag](TableApi.md#cancelcolumndrag)). |

#### Returns

[`GeColumnMoveEvent`](GeColumnMoveEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L26)

## Properties

### columnDef

• `Readonly` **columnDef**: `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

The column definition of the dragged column.

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L34)

___

### columnOrder

• `Readonly` **columnOrder**: `string`[]

The properties of all columns in the order now (after the move for `"end"`).

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L38)

___

### fromIndex

• `Readonly` **fromIndex**: `number`

Model index of the column when the drag started.

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L30)

___

### originalEvent

• `Optional` `Readonly` **originalEvent**: `Event`

The browser event behind it (mouse up; `undefined` for [TableApi.cancelColumnDrag](TableApi.md#cancelcolumndrag)).

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L40)

___

### property

• `Readonly` **property**: `undefined` \| `string`

The property of the dragged column (`columnDef.property`).

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L36)

___

### toIndex

• `Readonly` **toIndex**: `number`

Model index of the column now (`"start"` and `"cancel"`: `fromIndex`; `"end"`: also when it did not change).

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L32)

___

### type

• `Readonly` **type**: [`GeColumnDragEventType`](../modules.md#gecolumndrageventtype)

Phase: `"start"`, `"end"` or `"cancel"` (Escape: the old order is back).

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L28)

## Accessors

### moved

• `get` **moved**(): `boolean`

true if the column has another index now (`toIndex !== fromIndex`).

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/common/event/ge-column-move-event.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-move-event.ts#L45)
