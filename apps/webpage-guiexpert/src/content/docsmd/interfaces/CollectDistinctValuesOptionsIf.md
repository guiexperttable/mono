[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CollectDistinctValuesOptionsIf

# Interface: CollectDistinctValuesOptionsIf

Options for [collectDistinctValues](../modules.md#collectdistinctvalues).

## Table of contents

### Properties

- [blanksLabel](CollectDistinctValuesOptionsIf.md#blankslabel)
- [formatValue](CollectDistinctValuesOptionsIf.md#formatvalue)
- [maxValues](CollectDistinctValuesOptionsIf.md#maxvalues)
- [search](CollectDistinctValuesOptionsIf.md#search)

## Properties

### blanksLabel

• `Optional` **blanksLabel**: `string`

Label for blank values (`null`, `undefined`, `""`, `NaN`). Default `"(Blanks)"`.

#### Defined in

[src/lib/table/column-filter/collect-distinct-values.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/collect-distinct-values.ts#L11)

___

### formatValue

• `Optional` **formatValue**: (`value`: `unknown`) => `string`

#### Type declaration

▸ (`value`): `string`

Optional custom formatter for non-blank values.

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `unknown` |

##### Returns

`string`

#### Defined in

[src/lib/table/column-filter/collect-distinct-values.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/collect-distinct-values.ts#L13)

___

### maxValues

• `Optional` **maxValues**: `number`

Maximum distinct values to collect before truncating (default `10_000`).

#### Defined in

[src/lib/table/column-filter/collect-distinct-values.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/collect-distinct-values.ts#L7)

___

### search

• `Optional` **search**: `string`

Case-insensitive substring filter applied to item labels during collection.

#### Defined in

[src/lib/table/column-filter/collect-distinct-values.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/collect-distinct-values.ts#L9)
