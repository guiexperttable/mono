[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroup

# Class: RowGroup\<T\>

A group of a row grouping (see [RowGroupIf](../interfaces/RowGroupIf.md)). Created by [groupRows](../modules.md#grouprows) and [AreaModelRowGroups](AreaModelRowGroups.md) –
you don't create groups yourself.

**`Example`**

```ts
const groups = groupRows(sales, ["region"]);
aggregateRowGroups(groups, { umsatz: "sum" });
groups.map(g => `${g.label}: ${g.results.umsatz}`);   // ["Nord: 270", "Süd: 180"]
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Implements

- [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](RowGroup.md#constructor)

### Properties

- [children](RowGroup.md#children)
- [count](RowGroup.md#count)
- [field](RowGroup.md#field)
- [key](RowGroup.md#key)
- [label](RowGroup.md#label)
- [level](RowGroup.md#level)
- [parent](RowGroup.md#parent)
- [path](RowGroup.md#path)
- [results](RowGroup.md#results)
- [type](RowGroup.md#type)

### Accessors

- [id](RowGroup.md#id)

### Methods

- [getRows](RowGroup.md#getrows)
- [isLeaf](RowGroup.md#isleaf)

## Constructors

### constructor

• **new RowGroup**\<`T`\>(`key`, `label`, `level`, `field`, `path`, `parent`, `typedKey`): [`RowGroup`](RowGroup.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `unknown` |
| `label` | `string` |
| `level` | `number` |
| `field` | `string` |
| `path` | readonly `unknown`[] |
| `parent` | `undefined` \| [`RowGroup`](RowGroup.md)\<`T`\> |
| `typedKey` | `string` |

#### Returns

[`RowGroup`](RowGroup.md)\<`T`\>

#### Defined in

[src/lib/table/rowgroup/row-group.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L34)

## Properties

### children

• `Readonly` **children**: [`RowGroup`](RowGroup.md)\<`T`\>[] = `[]`

The sub-groups, empty on the last level.

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[children](../interfaces/RowGroupIf.md#children)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L21)

___

### count

• **count**: `number` = `0`

The number of rows in the group (after the filter).

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[count](../interfaces/RowGroupIf.md#count)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L22)

___

### field

• `Readonly` **field**: `string`

The name of the level ([RowGroupFieldIf.name](../interfaces/RowGroupFieldIf.md#name)).

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[field](../interfaces/RowGroupIf.md#field)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L38)

___

### key

• `Readonly` **key**: `unknown`

The key of the group, as the rows have it (`null` for the group of empty keys: `null`, `undefined`, `""`).

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[key](../interfaces/RowGroupIf.md#key)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L35)

___

### label

• `Readonly` **label**: `string`

The key as text (`format` of the level, otherwise the default text).

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[label](../interfaces/RowGroupIf.md#label)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L36)

___

### level

• `Readonly` **level**: `number`

The level, 0 = top.

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[level](../interfaces/RowGroupIf.md#level)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L37)

___

### parent

• `Readonly` **parent**: `undefined` \| [`RowGroup`](RowGroup.md)\<`T`\>

The parent group, undefined on the top level.

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[parent](../interfaces/RowGroupIf.md#parent)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L40)

___

### path

• `Readonly` **path**: readonly `unknown`[]

The keys from the top level down to this group.

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[path](../interfaces/RowGroupIf.md#path)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L39)

___

### results

• **results**: `Record`\<`string`, `unknown`\> = `{}`

The aggregates of the group by key (after the filter), e.g. `{ umsatz: 270 }`.

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[results](../interfaces/RowGroupIf.md#results)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L23)

___

### type

• `Readonly` **type**: ``"RowGroup"``

Marker for [isRowGroup](../modules.md#isrowgroup).

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[type](../interfaces/RowGroupIf.md#type)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L19)

## Accessors

### id

• `get` **id**(): `string`

A stable id from level names and keys, e.g. `rowgroup:[["region","s:Nord"]]`.

#### Returns

`string`

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[id](../interfaces/RowGroupIf.md#id)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L49)

## Methods

### getRows

▸ **getRows**(`filtered?`): `T`[]

The rows of the group and of all sub-groups, in the order of the grouped view: sub-group by sub-group, the rows of a
group in source order – or sorted, after the table sorted them.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filtered` | `boolean` | `true` | only the rows the filter keeps |

#### Returns

`T`[]

a new array

#### Implementation of

[RowGroupIf](../interfaces/RowGroupIf.md).[getRows](../interfaces/RowGroupIf.md#getrows)

#### Defined in

[src/lib/table/rowgroup/row-group.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L58)

___

### isLeaf

▸ **isLeaf**(): `boolean`

True for a group of the last level (it holds rows, no sub-groups).

#### Returns

`boolean`

#### Defined in

[src/lib/table/rowgroup/row-group.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.ts#L54)
