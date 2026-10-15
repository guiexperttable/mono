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
- [showValuesAs](PivotValueInfoIf.md#showvaluesas)

## Properties

### aggregator

• `Readonly` **aggregator**: [`AggregatorIf`](AggregatorIf.md)\<`any`, `unknown`\>

The aggregator.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L77)

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

[src/lib/table/pivot/pivot-value.type.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L79)

___

### label

• `Readonly` **label**: `string`

The header label.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L75)

___

### name

• `Readonly` **name**: `string`

The id ([PivotValueIf.name](PivotValueIf.md#name)).

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L73)

___

### showValuesAs

• `Optional` `Readonly` **showValuesAs**: [`ShowValuesAsIf`](ShowValuesAsIf.md)

„Show values as“, if one was given (since 1.1.95).

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L81)
