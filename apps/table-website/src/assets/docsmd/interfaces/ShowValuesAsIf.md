[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ShowValuesAsIf

# Interface: ShowValuesAsIf

„Show values as“ with options: mode, decimals, own text.

**`Example`**

```ts
ColumnDef.create({
  property: "total", headerLabel: "Share",
  showValuesAs: { mode: "percentOfColumnTotal", fractionDigits: 2 }   // "66.70%"
});
```

**`Since`**

1.1.95

## Table of contents

### Properties

- [format](ShowValuesAsIf.md#format)
- [fractionDigits](ShowValuesAsIf.md#fractiondigits)
- [mode](ShowValuesAsIf.md#mode)

## Properties

### format

• `Optional` **format**: (`value`: `number`) => `string`

#### Type declaration

▸ (`value`): `string`

An own text of the shown value (a fraction for percentages, e.g. `0.667`). Text only – never HTML.

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

##### Returns

`string`

#### Defined in

[src/lib/table/calc/show-values-as.type.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/show-values-as.type.ts#L51)

___

### fractionDigits

• `Optional` **fractionDigits**: `number`

Decimals of the text. Default: 1 for percentages, at most 2 otherwise, 0 for `rank`.

#### Defined in

[src/lib/table/calc/show-values-as.type.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/show-values-as.type.ts#L49)

___

### mode

• **mode**: [`ShowValuesAs`](../modules.md#showvaluesas)

The mode.

#### Defined in

[src/lib/table/calc/show-values-as.type.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/calc/show-values-as.type.ts#L47)
