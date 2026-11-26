[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeColumnResizeEvent

# Class: GeColumnResizeEvent

The user resizes a column ([EventListenerIf.onColumnResizeStart](../interfaces/EventListenerIf.md#oncolumnresizestart), [EventListenerIf.onColumnResizeEnd](../interfaces/EventListenerIf.md#oncolumnresizeend)).

Only user actions report it – not [TableApi.setColumnWidth](TableApi.md#setcolumnwidth), [TableApi.applyState](TableApi.md#applystate),
[TableApi.autoResizeColumns](TableApi.md#autoresizecolumns) or [TableApi.autoResizeColumn](TableApi.md#autoresizecolumn). The end comes once per start, after the
table applied the width: in the handler [TableApi.getState](TableApi.md#getstate) and the table model already have it.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onColumnResizeEnd = (evt: GeColumnResizeEvent) => {
  if (evt.type === "end" && evt.property) {
    localStorage.setItem(`width-${evt.property}`, String(evt.newWidth));
  }
};
```

**`Since`**

1.1.110

## Table of contents

### Constructors

- [constructor](GeColumnResizeEvent.md#constructor)

### Properties

- [columnDef](GeColumnResizeEvent.md#columndef)
- [columnIndex](GeColumnResizeEvent.md#columnindex)
- [newWidth](GeColumnResizeEvent.md#newwidth)
- [oldWidth](GeColumnResizeEvent.md#oldwidth)
- [originalEvent](GeColumnResizeEvent.md#originalevent)
- [property](GeColumnResizeEvent.md#property)
- [source](GeColumnResizeEvent.md#source)
- [type](GeColumnResizeEvent.md#type)

## Constructors

### constructor

• **new GeColumnResizeEvent**(`type`, `source`, `columnIndex`, `columnDef`, `property`, `oldWidth`, `newWidth`, `originalEvent?`): [`GeColumnResizeEvent`](GeColumnResizeEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeColumnDragEventType`](../modules.md#gecolumndrageventtype) | Phase: `"start"`, `"end"` or `"cancel"`. |
| `source` | [`GeColumnResizeSource`](../modules.md#gecolumnresizesource) | Dragging the handle or a double click on it. |
| `columnIndex` | `number` | Model index of the column (over west, center and east). |
| `columnDef` | `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | The column definition – `undefined` for a table model without column definitions. |
| `property` | `undefined` \| `string` | The property of the column (`columnDef.property`) – use it to store the width, indices change. |
| `oldWidth` | `number` | Width in px when the drag started. |
| `newWidth` | `number` | Width in px now: `"start"` = `oldWidth`, `"end"` = the new width, `"cancel"` = `oldWidth` again. |
| `originalEvent?` | `Event` | The browser event behind it (mouse up, double click; `undefined` for [TableApi.cancelColumnDrag](TableApi.md#cancelcolumndrag)). |

#### Returns

[`GeColumnResizeEvent`](GeColumnResizeEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L43)

## Properties

### columnDef

• `Readonly` **columnDef**: `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

The column definition – `undefined` for a table model without column definitions.

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L51)

___

### columnIndex

• `Readonly` **columnIndex**: `number`

Model index of the column (over west, center and east).

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L49)

___

### newWidth

• `Readonly` **newWidth**: `number`

Width in px now: `"start"` = `oldWidth`, `"end"` = the new width, `"cancel"` = `oldWidth` again.

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L57)

___

### oldWidth

• `Readonly` **oldWidth**: `number`

Width in px when the drag started.

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L55)

___

### originalEvent

• `Optional` `Readonly` **originalEvent**: `Event`

The browser event behind it (mouse up, double click; `undefined` for [TableApi.cancelColumnDrag](TableApi.md#cancelcolumndrag)).

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L59)

___

### property

• `Readonly` **property**: `undefined` \| `string`

The property of the column (`columnDef.property`) – use it to store the width, indices change.

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L53)

___

### source

• `Readonly` **source**: [`GeColumnResizeSource`](../modules.md#gecolumnresizesource)

Dragging the handle or a double click on it.

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L47)

___

### type

• `Readonly` **type**: [`GeColumnDragEventType`](../modules.md#gecolumndrageventtype)

Phase: `"start"`, `"end"` or `"cancel"`.

#### Defined in

[src/lib/table/data/common/event/ge-column-resize-event.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-column-resize-event.ts#L45)
