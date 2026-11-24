[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CoverGridFillOptionsIf

# Interface: CoverGridFillOptionsIf

A cover grid that fills the whole width ([TableOptionsIf.coverGridFill](TableOptionsIf.md#covergridfill), since 1.1.117): as many tiles per row
as fit with `tileWidth` (at least 1), then the tiles are stretched until the last one ends flush with the right
edge (the first columns get the rest pixels, 1 px each). With `aspectRatio` the height grows with the width.

**`Example`**

```ts
const fill: CoverGridFillOptionsIf = {
  tileWidth: 165,              // wanted (minimal) width of a tile
  aspectRatio: 220 / 165,      // height / width of the cover image
  extraHeight: 44              // two lines of text below the cover
};
// 960 px → 5 tiles of 192 × 300 px (round(192 × 220 / 165) + 44)
```

**`Since`**

1.1.117

## Table of contents

### Properties

- [aspectRatio](CoverGridFillOptionsIf.md#aspectratio)
- [extraHeight](CoverGridFillOptionsIf.md#extraheight)
- [tileWidth](CoverGridFillOptionsIf.md#tilewidth)

## Properties

### aspectRatio

• `Optional` **aspectRatio**: `number`

Height / width of the stretched part of the tile (e.g. `220 / 165` for a book cover). Tile height =
`round(tile width × aspectRatio) + extraHeight`. Not set: the height stays `coverHeight`.

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill-options.if.ts#L29)

___

### extraHeight

• `Optional` **extraHeight**: `number`

A fixed height added to the scaled height (a caption below the image), only with `aspectRatio`. Default 0.

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill-options.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill-options.if.ts#L31)

___

### tileWidth

• **tileWidth**: `number`

The wanted width of a tile in px – the minimal width: columns = `max(1, floor(width / tileWidth))`, then the tiles
get wider until they fill the row. With `coverGridFill: true` the `coverWidth` of the model.

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill-options.if.ts#L24)
