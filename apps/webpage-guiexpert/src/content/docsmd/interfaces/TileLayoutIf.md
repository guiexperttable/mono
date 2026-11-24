[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TileLayoutIf

# Interface: TileLayoutIf

A body whose cells are **one sequence of items** shown as tiles (a cover grid): item `i` sits in row
`floor(i / tilesPerRow)`, column `i % tilesPerRow`; the cells behind the last item are empty.

An area model that returns such a layout from [AreaModelIf.getTileLayout](AreaModelIf.md#gettilelayout) gets the keyboard navigation of a
tile grid instead of the cell navigation (since 1.1.115):

- ← / → move to the previous / next item and wrap over the end of a row; ↑ / ↓ move one row (↓ without an item
  below: the last item); Home / End go to the first / last item; Page Up / Down move a page.
- Empty tiles never get the focus (keyboard and mouse), Enter and double click on them report nothing.
- The focus follows the **item**: after sorting, filtering or a different number of tiles per row the same item
  has the focus (found with [indexOfTile](TileLayoutIf.md#indexoftile)).

[CoverGridBodyModel](../classes/CoverGridBodyModel.md) implements it.

**`Example`**

```ts
class PhotoBody extends AreaModel implements TileLayoutIf {
  constructor(private photos: string[], private perRow: number) { super(); }
  override getRowCount() { return Math.ceil(this.photos.length / this.perRow); }
  override getValueAt(rowIndex: number, columnIndex: number) { return this.photos[rowIndex * this.perRow + columnIndex]; }
  getTileLayout() { return this; }
  getTileCount() { return this.photos.length; }
  getTilesPerRow() { return this.perRow; }
  getTileAt(index: number) { return this.photos[index]; }
  indexOfTile(item: unknown) { return this.photos.indexOf(item as string); }
}
```

**`Since`**

1.1.115

## Implemented by

- [`CoverGridBodyModel`](../classes/CoverGridBodyModel.md)

## Table of contents

### Methods

- [getTileAt](TileLayoutIf.md#gettileat)
- [getTileCount](TileLayoutIf.md#gettilecount)
- [getTilesPerRow](TileLayoutIf.md#gettilesperrow)
- [indexOfTile](TileLayoutIf.md#indexoftile)

## Methods

### getTileAt

▸ **getTileAt**(`index`): `unknown`

The item of a tile: its identity (`===`) is what the focus follows. Return the **same** value for the same item
each time (objects of your list, ids) – a model that creates a new object per call never matches, and the table
would search with [indexOfTile](TileLayoutIf.md#indexoftile) in every render pass.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | index in the shown items |

#### Returns

`unknown`

the item, `undefined` outside the items

#### Defined in

[src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts#L49)

___

### getTileCount

▸ **getTileCount**(): `number`

The number of shown items (after the filter).

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts#L36)

___

### getTilesPerRow

▸ **getTilesPerRow**(): `number`

Tiles per row – at least 1.

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts#L39)

___

### indexOfTile

▸ **indexOfTile**(`item`): `number`

The index of an item in the shown items. Called only when the focused item is no longer in its cell (after
sorting, filtering, a resize) – never while scrolling.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `item` | `unknown` | an item [getTileAt](TileLayoutIf.md#gettileat) returned |

#### Returns

`number`

the index, `-1` if the item is not shown (filtered out, removed)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/tile-layout.if.ts#L58)
