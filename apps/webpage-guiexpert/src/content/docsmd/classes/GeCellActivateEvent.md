[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeCellActivateEvent

# Class: GeCellActivateEvent\<V, R\>

Reported by [EventListenerIf.onCellActivated](../interfaces/EventListenerIf.md#oncellactivated): the user "opens" a body cell – Enter on the focused cell or a
double click. One handler for keyboard and mouse: open the book of a cover grid, the order of a list.

It is reported only if the gesture did nothing else: Enter first toggles a row checkbox, a detail row
(master/detail) or a tree node and, with Excel-style editing, edits or moves down; a double click first opens the
editor of an editable cell or toggles a tree node. Empty tiles of a cover grid report nothing, a double click on a
button, link or input inside a cell belongs to that control, and a held Enter key reports once.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onCellActivated = (evt: GeCellActivateEvent) => {
  console.log(`open row ${evt.rowIndex} by ${evt.source}`, evt.row ?? evt.value);
};
```

**`Since`**

1.1.115

## Type parameters

| Name | Type |
| :------ | :------ |
| `V` | `any` |
| `R` | `any` |

## Table of contents

### Constructors

- [constructor](GeCellActivateEvent.md#constructor)

### Properties

- [areaIdent](GeCellActivateEvent.md#areaident)
- [columnIndex](GeCellActivateEvent.md#columnindex)
- [originalEvent](GeCellActivateEvent.md#originalevent)
- [row](GeCellActivateEvent.md#row)
- [rowIndex](GeCellActivateEvent.md#rowindex)
- [source](GeCellActivateEvent.md#source)
- [value](GeCellActivateEvent.md#value)

## Constructors

### constructor

• **new GeCellActivateEvent**\<`V`, `R`\>(`areaIdent`, `rowIndex`, `columnIndex`, `value`, `row`, `source`, `originalEvent?`): [`GeCellActivateEvent`](GeCellActivateEvent.md)\<`V`, `R`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `V` | `any` |
| `R` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | The area of the cell – always `"body"`. |
| `rowIndex` | `number` | Display row index of the cell. |
| `columnIndex` | `number` | Model column index of the cell. |
| `value` | `V` | The value of the cell (`getValueAt`) – in a cover grid the item of the tile. |
| `row` | `R` | The row (`getRowByIndex`): the row object of a list (the row array of `bodyData` tables); in a tree, row grouping or pivot a `TreeRow` (your object is `row.data`); `undefined` in a cover grid. |
| `source` | [`GeCellActivateSource`](../modules.md#gecellactivatesource) | Enter, double click or the API. |
| `originalEvent?` | `MouseEvent` \| `KeyboardEvent` | The key or mouse event (not for `"api"`). |

#### Returns

[`GeCellActivateEvent`](GeCellActivateEvent.md)\<`V`, `R`\>

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L32)

## Properties

### areaIdent

• `Readonly` **areaIdent**: [`AreaIdent`](../modules.md#areaident)

The area of the cell – always `"body"`.

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L34)

___

### columnIndex

• `Readonly` **columnIndex**: `number`

Model column index of the cell.

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L38)

___

### originalEvent

• `Optional` `Readonly` **originalEvent**: `MouseEvent` \| `KeyboardEvent`

The key or mouse event (not for `"api"`).

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L49)

___

### row

• `Readonly` **row**: `R`

The row (`getRowByIndex`): the row object of a list (the row array of `bodyData` tables); in a tree, row
grouping or pivot a `TreeRow` (your object is `row.data`); `undefined` in a cover grid.

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L45)

___

### rowIndex

• `Readonly` **rowIndex**: `number`

Display row index of the cell.

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L36)

___

### source

• `Readonly` **source**: [`GeCellActivateSource`](../modules.md#gecellactivatesource)

Enter, double click or the API.

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L47)

___

### value

• `Readonly` **value**: `V`

The value of the cell (`getValueAt`) – in a cover grid the item of the tile.

#### Defined in

[src/lib/table/data/common/event/ge-cell-activate-event.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-cell-activate-event.ts#L40)
