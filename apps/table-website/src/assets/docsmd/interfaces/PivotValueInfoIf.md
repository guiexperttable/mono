[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotValueInfoIf

# Interface: PivotValueInfoIf

A value of a pivot table as the table uses it: name, label, aggregator and format resolved
([PivotResult.values](../classes/PivotResult.md#values), [PivotColumnInfoIf.value](PivotColumnInfoIf.md#value)).

**`Example`**

```ts
const pivotBody = pivotModel.getPivotBody();
pivotBody.getResult().values.map(v => v.name);   // ["sum(umsatz)"]
```

**`Since`**

1.1.94

## Table of contents

### Properties

- [aggregator](PivotValueInfoIf.md#aggregator)
- [format](PivotValueInfoIf.md#format)
- [label](PivotValueInfoIf.md#label)
- [name](PivotValueInfoIf.md#name)

## Properties

### aggregator

• `Readonly` **aggregator**: [`AggregatorIf`](AggregatorIf.md)\<`any`, `unknown`\>

The aggregator.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L66)

___

### format

• `Optional` `Readonly` **format**: (`result`: `unknown`) => `string`

#### Type declaration

▸ (`result`): `string`

The format of a result, if one was given.

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `unknown` |

##### Returns

`string`

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L68)

___

### label

• `Readonly` **label**: `string`

The header label.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L64)

___

### name

• `Readonly` **name**: `string`

The id ([PivotValueIf.name](PivotValueIf.md#name)).

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L62)
