[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeRowDragEvent

# Class: GeRowDragEvent\<T\>

A row drag ([EventListenerIf.onRowDragStart](../interfaces/EventListenerIf.md#onrowdragstart), [EventListenerIf.onRowDragMove](../interfaces/EventListenerIf.md#onrowdragmove),
[EventListenerIf.onRowDragEnd](../interfaces/EventListenerIf.md#onrowdragend)).

Call [preventDefault](GeRowDragEvent.md#preventdefault) to veto: in `"start"` no drag happens, in `"move"` the target is invalid (no drop
marker, no drop). In managed mode `"end"` comes after the move (`moved`, `toIndex` = the real position).

**`Example`**

```ts
const listener = new EventAdapter();
listener.onRowDragEnd = (evt: GeRowDragEvent<Order>) => {
  if (evt.moved) {
    const ids = evt.rows.map(order => order.id);
    void fetch("/api/orders/move", { method: "POST", body: JSON.stringify({ ids, toIndex: evt.toIndex }) });
  }
};
```

**`Since`**

1.1.95

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Constructors

- [constructor](GeRowDragEvent.md#constructor)

### Properties

- [managed](GeRowDragEvent.md#managed)
- [moved](GeRowDragEvent.md#moved)
- [originalEvent](GeRowDragEvent.md#originalevent)
- [outside](GeRowDragEvent.md#outside)
- [rowIndices](GeRowDragEvent.md#rowindices)
- [rows](GeRowDragEvent.md#rows)
- [source](GeRowDragEvent.md#source)
- [target](GeRowDragEvent.md#target)
- [toIndex](GeRowDragEvent.md#toindex)
- [type](GeRowDragEvent.md#type)

### Accessors

- [defaultPrevented](GeRowDragEvent.md#defaultprevented)

### Methods

- [preventDefault](GeRowDragEvent.md#preventdefault)

## Constructors

### constructor

• **new GeRowDragEvent**\<`T`\>(`type`, `source`, `rows`, `rowIndices`, `target`, `toIndex`, `outside`, `managed`, `originalEvent?`): [`GeRowDragEvent`](GeRowDragEvent.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeRowDragEventType`](../modules.md#gerowdrageventtype) | Phase of the drag. |
| `source` | [`GeRowDragSource`](../modules.md#gerowdragsource) | Pointer or keyboard. |
| `rows` | `T`[] | The dragged row objects (tree: the `TreeRow`s) in display order. |
| `rowIndices` | `number`[] | Display indices of the dragged rows when the drag started (ascending). |
| `target` | `undefined` \| [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) | The current drop target – `undefined` if there is none (invalid, vetoed, outside the table). |
| `toIndex` | `number` | Flat tables: display index of the first dragged row after the drop (`0` = first row), `-1` without target. Trees: `-1` before the move; in a managed `"end"` the index the row really got. |
| `outside` | `boolean` | true if the pointer is outside the table – e.g. over an own drop zone of the page. |
| `managed` | `boolean` | true if the table moves the rows itself ([RowDragOptionsIf.managed](../interfaces/RowDragOptionsIf.md#managed)). |
| `originalEvent?` | `PointerEvent` \| `KeyboardEvent` | The browser event behind this event (pointer or keyboard). |

#### Returns

[`GeRowDragEvent`](GeRowDragEvent.md)\<`T`\>

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L47)

## Properties

### managed

• `Readonly` **managed**: `boolean`

true if the table moves the rows itself ([RowDragOptionsIf.managed](../interfaces/RowDragOptionsIf.md#managed)).

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L66)

___

### moved

• **moved**: `boolean` = `false`

true if the moved rows changed in the table (managed mode, `"end"`, not prevented).

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L43)

___

### originalEvent

• `Optional` `Readonly` **originalEvent**: `PointerEvent` \| `KeyboardEvent`

The browser event behind this event (pointer or keyboard).

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L68)

___

### outside

• `Readonly` **outside**: `boolean`

true if the pointer is outside the table – e.g. over an own drop zone of the page.

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L64)

___

### rowIndices

• `Readonly` **rowIndices**: `number`[]

Display indices of the dragged rows when the drag started (ascending).

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L55)

___

### rows

• `Readonly` **rows**: `T`[]

The dragged row objects (tree: the `TreeRow`s) in display order.

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L53)

___

### source

• `Readonly` **source**: [`GeRowDragSource`](../modules.md#gerowdragsource)

Pointer or keyboard.

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L51)

___

### target

• `Readonly` **target**: `undefined` \| [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md)

The current drop target – `undefined` if there is none (invalid, vetoed, outside the table).

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L57)

___

### toIndex

• **toIndex**: `number`

Flat tables: display index of the first dragged row after the drop (`0` = first row), `-1` without target.
Trees: `-1` before the move; in a managed `"end"` the index the row really got.

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L62)

___

### type

• `Readonly` **type**: [`GeRowDragEventType`](../modules.md#gerowdrageventtype)

Phase of the drag.

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L49)

## Accessors

### defaultPrevented

• `get` **defaultPrevented**(): `boolean`

true after [preventDefault](GeRowDragEvent.md#preventdefault).

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L73)

## Methods

### preventDefault

▸ **preventDefault**(): `void`

Veto: no drag (`"start"`), invalid target (`"move"`); no effect in `"end"` and `"cancel"`.

#### Returns

`void`

#### Defined in

[src/lib/table/data/common/event/ge-row-drag-event.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-row-drag-event.ts#L78)
