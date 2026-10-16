[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FillHandleOptions

# Class: FillHandleOptions

The defaults of [FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).

**`Example`**

```ts
const options = FillHandleOptions.create(true);
options?.direction;   // "both"
```

**`Since`**

1.1.96

## Implements

- [`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)

## Table of contents

### Constructors

- [constructor](FillHandleOptions.md#constructor)

### Properties

- [autoScrollMaxSpeedInPx](FillHandleOptions.md#autoscrollmaxspeedinpx)
- [autoScrollZoneInPx](FillHandleOptions.md#autoscrollzoneinpx)
- [direction](FillHandleOptions.md#direction)
- [dragThresholdInPx](FillHandleOptions.md#dragthresholdinpx)
- [fillValue](FillHandleOptions.md#fillvalue)
- [maxCells](FillHandleOptions.md#maxcells)

### Methods

- [create](FillHandleOptions.md#create)

## Constructors

### constructor

• **new FillHandleOptions**(): [`FillHandleOptions`](FillHandleOptions.md)

#### Returns

[`FillHandleOptions`](FillHandleOptions.md)

## Properties

### autoScrollMaxSpeedInPx

• **autoScrollMaxSpeedInPx**: `number` = `24`

Maximum auto-scroll speed in px per animation frame (default 24).

#### Implementation of

[FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).[autoScrollMaxSpeedInPx](../interfaces/FillHandleOptionsIf.md#autoscrollmaxspeedinpx)

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L20)

___

### autoScrollZoneInPx

• **autoScrollZoneInPx**: `number` = `40`

Width in px of the zone at the edges of the body that scrolls automatically (default 40).

#### Implementation of

[FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).[autoScrollZoneInPx](../interfaces/FillHandleOptionsIf.md#autoscrollzoneinpx)

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L19)

___

### direction

• **direction**: ``"both"`` \| ``"vertical"`` \| ``"horizontal"`` = `"both"`

Allowed directions: `"vertical"` (down/up), `"horizontal"` (right/left) or `"both"` (default).

#### Implementation of

[FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).[direction](../interfaces/FillHandleOptionsIf.md#direction)

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L15)

___

### dragThresholdInPx

• **dragThresholdInPx**: `number` = `3`

Distance in px the pointer has to move before a fill starts (default 3).

#### Implementation of

[FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).[dragThresholdInPx](../interfaces/FillHandleOptionsIf.md#dragthresholdinpx)

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L18)

___

### fillValue

• `Optional` **fillValue**: (`ctx`: [`FillValueContextIf`](../interfaces/FillValueContextIf.md)) => `unknown` = `undefined`

#### Type declaration

▸ (`ctx`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`FillValueContextIf`](../interfaces/FillValueContextIf.md) |

##### Returns

`unknown`

#### Implementation of

[FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).[fillValue](../interfaces/FillHandleOptionsIf.md#fillvalue)

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L16)

___

### maxCells

• **maxCells**: `number` = `100_000`

At most this many cells are filled at once (default 100,000); a bigger fill is refused and announced.

#### Implementation of

[FillHandleOptionsIf](../interfaces/FillHandleOptionsIf.md).[maxCells](../interfaces/FillHandleOptionsIf.md#maxcells)

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L17)

## Methods

### create

▸ **create**(`option?`): `undefined` \| [`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)

The options of [TableOptionsIf.fillHandle](../interfaces/TableOptionsIf.md#fillhandle): `undefined`/`false` = no fill handle, `true` = the defaults, an
object = the defaults overridden by its values (`undefined` keeps the default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)\> | `tableOptions.fillHandle` |

#### Returns

`undefined` \| [`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)

complete options, `undefined` if the fill handle is off

#### Defined in

[src/lib/table/fill/fill-handle-options.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-options.ts#L29)
