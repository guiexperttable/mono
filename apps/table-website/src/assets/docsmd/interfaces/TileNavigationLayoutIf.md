[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TileNavigationLayoutIf

# Interface: TileNavigationLayoutIf

The geometry [navigateTiles](../modules.md#navigatetiles) computes with.

**`Since`**

1.1.115

## Table of contents

### Properties

- [count](TileNavigationLayoutIf.md#count)
- [firstVisible](TileNavigationLayoutIf.md#firstvisible)
- [pageRows](TileNavigationLayoutIf.md#pagerows)
- [perRow](TileNavigationLayoutIf.md#perrow)

## Properties

### count

• **count**: `number`

Number of shown items.

#### Defined in

[src/lib/table/tile-navigation/tile-navigation.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/tile-navigation/tile-navigation.ts#L18)

___

### firstVisible

• `Optional` **firstVisible**: `number`

Where a move starts without a focused item (default 0): the first item of the first visible row.

#### Defined in

[src/lib/table/tile-navigation/tile-navigation.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/tile-navigation/tile-navigation.ts#L24)

___

### pageRows

• **pageRows**: `number`

Rows of a page for `pageUp`/`pageDown` (values below 1 count as 1).

#### Defined in

[src/lib/table/tile-navigation/tile-navigation.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/tile-navigation/tile-navigation.ts#L22)

___

### perRow

• **perRow**: `number`

Tiles per row (values below 1 count as 1).

#### Defined in

[src/lib/table/tile-navigation/tile-navigation.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/tile-navigation/tile-navigation.ts#L20)
