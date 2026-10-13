[GuiExpert Table API](../README.md) / [Exports](../modules.md) / Size

# Class: Size

A width with unit – used for [ColumnDefIf.width](../interfaces/ColumnDefIf.md#width), `minWidth` and `maxWidth`.
For pixel widths use the constants [px80](../modules.md#px80), [px100](../modules.md#px100), [px120](../modules.md#px120) … (`px0` – `px500`).

**`Example`**

```ts
new Size(37, "px");        // fixed
new Size(10, "%");         // 10 % of the table width (clamped by minWidth / maxWidth)
new Size(2, "weight");     // twice as much of the remaining space as a column with weight 1
```

## Implements

- [`SizeIf`](../interfaces/SizeIf.md)

## Table of contents

### Constructors

- [constructor](Size.md#constructor)

### Properties

- [unit](Size.md#unit)
- [value](Size.md#value)

## Constructors

### constructor

• **new Size**(`value?`, `unit?`): [`Size`](Size.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `value` | `number` | `100` |
| `unit` | [`SizeUnitType`](../modules.md#sizeunittype) | `"px"` |

#### Returns

[`Size`](Size.md)

#### Defined in

[src/lib/table/data/common/size.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/size.ts#L16)

## Properties

### unit

• **unit**: [`SizeUnitType`](../modules.md#sizeunittype) = `"px"`

#### Implementation of

[SizeIf](../interfaces/SizeIf.md).[unit](../interfaces/SizeIf.md#unit)

#### Defined in

[src/lib/table/data/common/size.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/size.ts#L18)

___

### value

• **value**: `number` = `100`

#### Implementation of

[SizeIf](../interfaces/SizeIf.md).[value](../interfaces/SizeIf.md#value)

#### Defined in

[src/lib/table/data/common/size.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/size.ts#L17)
