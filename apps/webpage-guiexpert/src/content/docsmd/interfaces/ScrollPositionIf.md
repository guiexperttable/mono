[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ScrollPositionIf

# Interface: ScrollPositionIf

A scroll position – the argument of [TableApi.repaintHard](../classes/TableApi.md#repainthard) (since 1.1.107): the rows are counted again and the
table shows this position in the same render pass. A missing axis keeps its position.

- `px`: the horizontal scroll position from the start (0 = the first center column at the start; right-to-left
  measured from the right edge, see [TableOptionsIf.direction](TableOptionsIf.md#direction)) – the same as the first argument of
  [TableApi.scrollToPixel](../classes/TableApi.md#scrolltopixel) (scroll bar pixels, not a column offset: for a column use `scrollToIndex`).
- `py`: a **content** position from the top of the first body row (with the heights of open detail rows above) – the same as the second
  argument of [TableApi.scrollToPixel](../classes/TableApi.md#scrolltopixel), also exact with a capped scroll height (more than
  [EleScope.maxScrollHeightInPx](../classes/EleScope.md#maxscrollheightinpx) px of rows).

**`Example`**

```ts
// live tail: rows were appended – count them and show row 500,000 (20 px rows) at the top
tableApi.repaintHard({ py: 500_000 * 20 });
```

**`Example`**

```ts
// only horizontally: back to the first column, the vertical position stays
tableApi.repaintHard({ px: 0 });
```

**`Since`**

1.1.107

## Table of contents

### Properties

- [px](ScrollPositionIf.md#px)
- [py](ScrollPositionIf.md#py)

## Properties

### px

• `Optional` **px**: `number`

Horizontal scroll position in px from the start (like `scrollToPixel`). Missing: the horizontal position stays.

#### Defined in

[src/lib/table/data/common/scroll-position.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/scroll-position.if.ts#L25)

___

### py

• `Optional` **py**: `number`

Vertical content position in px from the top of the first body row. Missing: the vertical position stays.

#### Defined in

[src/lib/table/data/common/scroll-position.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/scroll-position.if.ts#L27)
