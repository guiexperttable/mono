[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FillHandleOptionsIf

# Interface: FillHandleOptionsIf

Options of the fill handle ([TableOptionsIf.fillHandle](TableOptionsIf.md#fillhandle)): the small square at the bottom right corner of the
selected range. Dragging it fills the neighbouring cells – copies values or continues series (1, 2, 3 …; dates;
`Item 1` → `Item 2`). Needs a [SelectionModel](../classes/SelectionModel.md) of the type `"range"`.

**`Example`**

```ts
const selectionModel = new SelectionModel("range", "multi");   // one model – not a new one per call
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel,
  fillHandle: { direction: "vertical" },
};
```

**`Since`**

1.1.96

## Implemented by

- [`FillHandleOptions`](../classes/FillHandleOptions.md)

## Table of contents

### Properties

- [autoScrollMaxSpeedInPx](FillHandleOptionsIf.md#autoscrollmaxspeedinpx)
- [autoScrollZoneInPx](FillHandleOptionsIf.md#autoscrollzoneinpx)
- [direction](FillHandleOptionsIf.md#direction)
- [dragThresholdInPx](FillHandleOptionsIf.md#dragthresholdinpx)
- [fillValue](FillHandleOptionsIf.md#fillvalue)
- [maxCells](FillHandleOptionsIf.md#maxcells)

## Properties

### autoScrollMaxSpeedInPx

• **autoScrollMaxSpeedInPx**: `number`

Maximum auto-scroll speed in px per animation frame (default 24).

#### Defined in

[src/lib/table/fill/fill-handle-options.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.if.ts#L40)

___

### autoScrollZoneInPx

• **autoScrollZoneInPx**: `number`

Width in px of the zone at the edges of the body that scrolls automatically (default 40).

#### Defined in

[src/lib/table/fill/fill-handle-options.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.if.ts#L37)

___

### direction

• **direction**: ``"both"`` \| ``"vertical"`` \| ``"horizontal"``

Allowed directions: `"vertical"` (down/up), `"horizontal"` (right/left) or `"both"` (default).

#### Defined in

[src/lib/table/fill/fill-handle-options.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.if.ts#L22)

___

### dragThresholdInPx

• **dragThresholdInPx**: `number`

Distance in px the pointer has to move before a fill starts (default 3).

#### Defined in

[src/lib/table/fill/fill-handle-options.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.if.ts#L34)

___

### fillValue

• `Optional` **fillValue**: (`ctx`: [`FillValueContextIf`](FillValueContextIf.md)) => `unknown`

#### Type declaration

▸ (`ctx`): `unknown`

Own fill function, called for every filled cell. Return the value – or `undefined` for the default
(`ctx.defaultValue`).

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`FillValueContextIf`](FillValueContextIf.md) |

##### Returns

`unknown`

#### Defined in

[src/lib/table/fill/fill-handle-options.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.if.ts#L28)

___

### maxCells

• **maxCells**: `number`

At most this many cells are filled at once (default 100,000); a bigger fill is refused and announced.

#### Defined in

[src/lib/table/fill/fill-handle-options.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.if.ts#L31)
