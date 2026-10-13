[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeMouseEvent

# Class: GeMouseEvent

A mouse event of the table: where it happened (area, side, row, column) plus the browser event.
Passed to [EventListenerIf.onMouseClicked](../interfaces/EventListenerIf.md#onmouseclicked), [EventListenerIf.onContextmenu](../interfaces/EventListenerIf.md#oncontextmenu) and the other mouse methods.

`rowIndex` is the row as **displayed** (after filter and sorting) – get your object with
`tableModel.getBodyModel().getRowByIndex(evt.rowIndex)`.

**`Example`**

```ts
override onContextmenu(evt: GeMouseEvent): void {
  if (evt.areaIdent !== "body" || evt.rowIndex < 0) return;
  evt.originalEvent?.preventDefault();                       // no browser menu
  showMyMenu(evt.originalEvent!.clientX, evt.originalEvent!.clientY, evt.rowIndex);
}
```

**`See`**

Training: [Events and a context menu of your own](https://gui.expert/training/events-and-context-menu/)

## Table of contents

### Constructors

- [constructor](GeMouseEvent.md#constructor)

### Properties

- [action](GeMouseEvent.md#action)
- [areaIdent](GeMouseEvent.md#areaident)
- [clickCount](GeMouseEvent.md#clickcount)
- [columnIndex](GeMouseEvent.md#columnindex)
- [columnLeft](GeMouseEvent.md#columnleft)
- [draggingX](GeMouseEvent.md#draggingx)
- [draggingY](GeMouseEvent.md#draggingy)
- [originalEvent](GeMouseEvent.md#originalevent)
- [rowIndex](GeMouseEvent.md#rowindex)
- [rowTop](GeMouseEvent.md#rowtop)
- [sideIdent](GeMouseEvent.md#sideident)

### Methods

- [clone](GeMouseEvent.md#clone)

## Constructors

### constructor

• **new GeMouseEvent**(`rowIndex?`, `rowTop?`, `columnIndex?`, `columnLeft?`, `areaIdent?`, `sideIdent?`, `originalEvent?`, `clickCount?`, `draggingX?`, `draggingY?`, `action?`): [`GeMouseEvent`](GeMouseEvent.md)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowIndex` | `number` | `-1` | Row index in the area (as displayed); -1 outside of rows. |
| `rowTop` | `number` | `-1` | Top position of the row in px. |
| `columnIndex` | `number` | `-1` | Column index (model index over west + center + east); -1 outside of columns. |
| `columnLeft` | `number` | `-1` | Left position of the column in px. |
| `areaIdent?` | [`AreaIdent`](../modules.md#areaident) | `undefined` | `"header"`, `"body"` or `"footer"`. |
| `sideIdent?` | [`SideIdent`](../modules.md#sideident) | `undefined` | `"west"` (fixed left), `"center"` or `"east"` (fixed right). |
| `originalEvent?` | `MouseEvent` | `undefined` | The browser event – position, buttons, modifier keys. |
| `clickCount` | `number` | `0` | 1 = click, 2 = double-click on the same cell. |
| `draggingX` | `number` | `0` | Horizontal distance in px while dragging. |
| `draggingY` | `number` | `0` | Vertical distance in px while dragging. |
| `action` | ``null`` \| `string` | `""` | Internal action of the clicked element (e.g. a tree arrow), otherwise empty. |

#### Returns

[`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L25)

## Properties

### action

• **action**: ``null`` \| `string` = `""`

Internal action of the clicked element (e.g. a tree arrow), otherwise empty.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L47)

___

### areaIdent

• `Optional` **areaIdent**: [`AreaIdent`](../modules.md#areaident)

`"header"`, `"body"` or `"footer"`.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L35)

___

### clickCount

• **clickCount**: `number` = `0`

1 = click, 2 = double-click on the same cell.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L41)

___

### columnIndex

• **columnIndex**: `number` = `-1`

Column index (model index over west + center + east); -1 outside of columns.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L31)

___

### columnLeft

• **columnLeft**: `number` = `-1`

Left position of the column in px.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L33)

___

### draggingX

• **draggingX**: `number` = `0`

Horizontal distance in px while dragging.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L43)

___

### draggingY

• **draggingY**: `number` = `0`

Vertical distance in px while dragging.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L45)

___

### originalEvent

• `Optional` **originalEvent**: `MouseEvent`

The browser event – position, buttons, modifier keys.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L39)

___

### rowIndex

• **rowIndex**: `number` = `-1`

Row index in the area (as displayed); -1 outside of rows.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L27)

___

### rowTop

• **rowTop**: `number` = `-1`

Top position of the row in px.

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L29)

___

### sideIdent

• `Optional` **sideIdent**: [`SideIdent`](../modules.md#sideident)

`"west"` (fixed left), `"center"` or `"east"` (fixed right).

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L37)

## Methods

### clone

▸ **clone**(): [`GeMouseEvent`](GeMouseEvent.md)

#### Returns

[`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-mouse-event.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-mouse-event.ts#L51)
