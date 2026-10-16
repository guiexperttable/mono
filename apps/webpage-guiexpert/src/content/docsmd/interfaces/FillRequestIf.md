[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FillRequestIf

# Interface: FillRequestIf

Input of [computeFillChanges](../modules.md#computefillchanges).

**`Since`**

1.1.96

## Table of contents

### Properties

- [count](FillRequestIf.md#count)
- [direction](FillRequestIf.md#direction)
- [fillValue](FillRequestIf.md#fillvalue)
- [getCellInfo](FillRequestIf.md#getcellinfo)
- [getValue](FillRequestIf.md#getvalue)
- [isFillable](FillRequestIf.md#isfillable)
- [mode](FillRequestIf.md#mode)
- [source](FillRequestIf.md#source)

## Properties

### count

• **count**: `number`

The number of rows (down/up) or columns (right/left) to fill.

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L19)

___

### direction

• **direction**: [`FillDirection`](../modules.md#filldirection)

Where the range is extended to.

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L17)

___

### fillValue

• `Optional` **fillValue**: (`ctx`: [`FillValueContextIf`](FillValueContextIf.md)) => `unknown`

#### Type declaration

▸ (`ctx`): `unknown`

Own fill function, see [FillHandleOptionsIf.fillValue](FillHandleOptionsIf.md#fillvalue).

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`FillValueContextIf`](FillValueContextIf.md) |

##### Returns

`unknown`

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L27)

___

### getCellInfo

• `Optional` **getCellInfo**: (`rowIndex`: `number`, `columnIndex`: `number`) => \{ `property`: `string` ; `row`: `unknown`  }

#### Type declaration

▸ (`rowIndex`, `columnIndex`): `Object`

Row object and property of a cell – for `fillValue`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `row` | `unknown` |

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L29)

___

### getValue

• **getValue**: (`rowIndex`: `number`, `columnIndex`: `number`) => `unknown`

#### Type declaration

▸ (`rowIndex`, `columnIndex`): `unknown`

The shown value of a cell (batch edit: the pending value).

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

##### Returns

`unknown`

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L23)

___

### isFillable

• `Optional` **isFillable**: (`rowIndex`: `number`, `columnIndex`: `number`) => `boolean`

#### Type declaration

▸ (`rowIndex`, `columnIndex`): `boolean`

`false` skips a target cell (not editable, hidden column …); the series keeps counting.

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

##### Returns

`boolean`

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L25)

___

### mode

• `Optional` **mode**: [`FillMode`](../modules.md#fillmode)

Series or copy, see [FillMode](../modules.md#fillmode).

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L21)

___

### source

• **source**: [`CellRange`](../classes/CellRange.md)

The selected source range (body display indices, `r1 <= r2`, `c1 <= c2`).

#### Defined in

[src/lib/table/fill/compute-fill-changes.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/compute-fill-changes.ts#L15)
