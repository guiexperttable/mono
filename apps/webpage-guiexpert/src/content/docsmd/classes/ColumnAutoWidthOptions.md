[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnAutoWidthOptions

# Class: ColumnAutoWidthOptions

The defaults of [ColumnAutoWidthOptionsIf](../interfaces/ColumnAutoWidthOptionsIf.md): double click on, all body rows up to 10 000, no own measurement.

**`Example`**

```ts
const options = ColumnAutoWidthOptions.create({ maxRows: 1_000 });
console.log(options.doubleClick, options.maxRows); // true 1000
```

**`Since`**

1.1.110

## Implements

- [`ColumnAutoWidthOptionsIf`](../interfaces/ColumnAutoWidthOptionsIf.md)

## Table of contents

### Constructors

- [constructor](ColumnAutoWidthOptions.md#constructor)

### Properties

- [doubleClick](ColumnAutoWidthOptions.md#doubleclick)
- [getWidth](ColumnAutoWidthOptions.md#getwidth)
- [maxRows](ColumnAutoWidthOptions.md#maxrows)

### Methods

- [create](ColumnAutoWidthOptions.md#create)

## Constructors

### constructor

• **new ColumnAutoWidthOptions**(): [`ColumnAutoWidthOptions`](ColumnAutoWidthOptions.md)

#### Returns

[`ColumnAutoWidthOptions`](ColumnAutoWidthOptions.md)

## Properties

### doubleClick

• **doubleClick**: `boolean` = `true`

A double click on the resize handle fits the width of the column to its content. Only where a handle is
(`columnsResizable` and the column is not `resizable: false`). Default `true`.

#### Implementation of

[ColumnAutoWidthOptionsIf](../interfaces/ColumnAutoWidthOptionsIf.md).[doubleClick](../interfaces/ColumnAutoWidthOptionsIf.md#doubleclick)

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.ts#L14)

___

### getWidth

• `Optional` **getWidth**: (`ctx`: [`ColumnAutoWidthContextIf`](../interfaces/ColumnAutoWidthContextIf.md)) => `undefined` \| `number`

#### Type declaration

▸ (`ctx`): `undefined` \| `number`

Own measurement: return the width in px, or `undefined` for the default. The result is limited by
`minWidth` / `maxWidth` of the column.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`ColumnAutoWidthContextIf`](../interfaces/ColumnAutoWidthContextIf.md) |

##### Returns

`undefined` \| `number`

#### Implementation of

[ColumnAutoWidthOptionsIf](../interfaces/ColumnAutoWidthOptionsIf.md).[getWidth](../interfaces/ColumnAutoWidthOptionsIf.md#getwidth)

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.ts#L16)

___

### maxRows

• **maxRows**: `number` = `10_000`

Body rows that are measured: up to this number of rows all of them, above only the rows drawn now (the time stays
the same with millions of rows). Header and footer are always measured. Default `10_000`.

#### Implementation of

[ColumnAutoWidthOptionsIf](../interfaces/ColumnAutoWidthOptionsIf.md).[maxRows](../interfaces/ColumnAutoWidthOptionsIf.md#maxrows)

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.ts#L15)

## Methods

### create

▸ **create**(`options?`): [`ColumnAutoWidthOptionsIf`](../interfaces/ColumnAutoWidthOptionsIf.md)

The defaults merged with `options` (`tableOptions.columnAutoWidth`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Partial`\<[`ColumnAutoWidthOptionsIf`](../interfaces/ColumnAutoWidthOptionsIf.md)\> | own values |

#### Returns

[`ColumnAutoWidthOptionsIf`](../interfaces/ColumnAutoWidthOptionsIf.md)

complete options

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.ts#L24)
