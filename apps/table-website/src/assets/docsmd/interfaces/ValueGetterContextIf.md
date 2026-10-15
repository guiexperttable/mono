[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ValueGetterContextIf

# Interface: ValueGetterContextIf

The second parameter of a [ValueGetter](../modules.md#valuegetter): access to other columns of the same table – also calculated ones –
and to column aggregates over the (filtered) rows. Formulas ([compileFormula](../modules.md#compileformula)) use it for `[total]` and
`SUM([total])`.

**`Example`**

```ts
ColumnDef.create({
  property: "share", headerLabel: "Share",
  valueGetter: (row: Item, ctx: ValueGetterContextIf) =>
    Number(ctx.getValue(row, "total")) / Number(ctx.aggregate("total", "sum"))
});
```

**`Since`**

1.1.95

## Table of contents

### Properties

- [property](ValueGetterContextIf.md#property)

### Methods

- [aggregate](ValueGetterContextIf.md#aggregate)
- [getValue](ValueGetterContextIf.md#getvalue)
- [hasColumn](ValueGetterContextIf.md#hascolumn)
- [isCalculated](ValueGetterContextIf.md#iscalculated)

## Properties

### property

• `Readonly` **property**: `string`

The property of the column that is computed.

#### Defined in

[src/lib/table/calc/value-getter-context.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/value-getter-context.if.ts#L20)

## Methods

### aggregate

▸ **aggregate**(`property`, `aggregator`): `unknown`

An aggregate of a column over the filtered rows of the body (cached until the data, filter or sorting changes),
e.g. `aggregate("total", "sum")`. Values that are no numbers are skipped (see [Aggregators](../modules.md#aggregators)).

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `aggregator` | [`AggregatorRef`](../modules.md#aggregatorref) |

#### Returns

`unknown`

#### Defined in

[src/lib/table/calc/value-getter-context.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/value-getter-context.if.ts#L34)

___

### getValue

▸ **getValue**(`row`, `property`): `unknown`

The value of another column of the row: its `valueGetter` (with protection against circular references –
a cycle returns a `#CIRC!` [FormulaError](../classes/FormulaError.md)) or the property path.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `any` |
| `property` | `string` |

#### Returns

`unknown`

#### Defined in

[src/lib/table/calc/value-getter-context.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/value-getter-context.if.ts#L25)

___

### hasColumn

▸ **hasColumn**(`property`): `boolean`

True if a column of the table shows this property.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/calc/value-getter-context.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/value-getter-context.if.ts#L27)

___

### isCalculated

▸ **isCalculated**(`property`): `boolean`

True if that column is calculated (`valueGetter` or `formula`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/calc/value-getter-context.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/value-getter-context.if.ts#L29)
